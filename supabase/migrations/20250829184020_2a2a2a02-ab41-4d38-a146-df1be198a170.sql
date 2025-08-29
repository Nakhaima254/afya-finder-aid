-- Create enum types
CREATE TYPE public.user_role AS ENUM ('consumer', 'pharmacy', 'admin');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'consumer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacies table
CREATE TABLE public.pharmacies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  license TEXT NOT NULL UNIQUE,
  verified BOOLEAN NOT NULL DEFAULT false,
  contact TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medicines table
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  strength TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  availability BOOLEAN NOT NULL DEFAULT true,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  status public.reservation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pharmacies
CREATE POLICY "Anyone can view verified pharmacies" ON public.pharmacies
  FOR SELECT USING (verified = true);

CREATE POLICY "Pharmacy owners can view their own pharmacy" ON public.pharmacies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pharmacy role users can create pharmacies" ON public.pharmacies
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.get_user_role(auth.uid()) = 'pharmacy');

CREATE POLICY "Pharmacy owners can update their own pharmacy" ON public.pharmacies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any pharmacy" ON public.pharmacies
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for medicines
CREATE POLICY "Anyone can view available medicines" ON public.medicines
  FOR SELECT USING (availability = true);

CREATE POLICY "Pharmacy owners can view all their medicines" ON public.medicines
  FOR SELECT USING (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = auth.uid())
  );

CREATE POLICY "Pharmacy owners can insert medicines" ON public.medicines
  FOR INSERT WITH CHECK (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = auth.uid())
  );

CREATE POLICY "Pharmacy owners can update their medicines" ON public.medicines
  FOR UPDATE USING (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = auth.uid())
  );

-- RLS Policies for reservations
CREATE POLICY "Users can view their own reservations" ON public.reservations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pharmacy owners can view reservations for their medicines" ON public.reservations
  FOR SELECT USING (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create reservations" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" ON public.reservations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Pharmacy owners can update reservations for their medicines" ON public.reservations
  FOR UPDATE USING (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = auth.uid())
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Unknown User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'consumer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacies_updated_at
  BEFORE UPDATE ON public.pharmacies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at
  BEFORE UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_medicines_pharmacy_id ON public.medicines(pharmacy_id);
CREATE INDEX idx_medicines_name ON public.medicines(name);
CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX idx_reservations_medicine_id ON public.reservations(medicine_id);
CREATE INDEX idx_pharmacies_location ON public.pharmacies(location);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);