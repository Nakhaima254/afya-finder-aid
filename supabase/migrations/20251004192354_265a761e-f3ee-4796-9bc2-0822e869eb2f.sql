-- First create pharmacies since none exist
INSERT INTO public.pharmacies (name, location, contact, license, user_id, verified) VALUES
('HealthPlus Pharmacy', 'Nairobi Central, Nairobi', '+254 700 123 456', 'PPB/2023/001', 'ea037323-5c5b-455f-b2d0-f2c8a5e0a202', true),
('MedCare Chemist', 'Westlands, Nairobi', '+254 701 234 567', 'PPB/2023/002', 'ea037323-5c5b-455f-b2d0-f2c8a5e0a202', true),
('Unity Pharmacy', 'Kilimani, Nairobi', '+254 702 345 678', 'PPB/2023/003', 'ea037323-5c5b-455f-b2d0-f2c8a5e0a202', true);

-- Now add medicines using the created pharmacies
INSERT INTO public.medicines (name, strength, price, pharmacy_id, availability) 
SELECT medicine_name, strength, price, pharmacy_id, availability
FROM (
  VALUES
    ('Paracetamol', '500mg', 80, true),
    ('Ibuprofen', '400mg', 120, true),
    ('Aspirin', '100mg', 95, true),
    ('Diclofenac', '50mg', 150, true),
    ('Tramadol', '50mg', 200, false),
    ('Amoxicillin', '250mg', 200, true),
    ('Amoxicillin', '500mg', 350, true),
    ('Azithromycin', '250mg', 450, true),
    ('Ciprofloxacin', '500mg', 320, false),
    ('Doxycycline', '100mg', 280, true),
    ('Augmentin', '625mg', 480, true),
    ('Cephalexin', '500mg', 390, true),
    ('Omeprazole', '20mg', 180, true),
    ('Metformin', '500mg', 160, true),
    ('Amlodipine', '5mg', 140, true),
    ('Atorvastatin', '20mg', 380, true),
    ('Levothyroxine', '100mcg', 220, true),
    ('Losartan', '50mg', 170, true),
    ('Lisinopril', '10mg', 160, true),
    ('Hydrochlorothiazide', '25mg', 120, true),
    ('Cetirizine', '10mg', 110, true),
    ('Loratadine', '10mg', 130, true),
    ('Dextromethorphan', '15mg', 180, true),
    ('Salbutamol', '100mcg', 250, true),
    ('Prednisolone', '5mg', 90, true),
    ('Montelukast', '10mg', 320, true),
    ('Vitamin C', '1000mg', 120, true),
    ('Vitamin D3', '1000IU', 180, true),
    ('Multivitamin', 'Adult', 250, true),
    ('Iron Tablets', '65mg', 150, true),
    ('Calcium', '500mg', 160, true),
    ('Folic Acid', '5mg', 80, true),
    ('Vitamin B12', '1000mcg', 190, true),
    ('Insulin Glargine', '100IU/ml', 1200, true),
    ('Gliclazide', '80mg', 190, true),
    ('Pioglitazone', '15mg', 280, false),
    ('Glimepiride', '2mg', 170, true),
    ('Ranitidine', '150mg', 140, true),
    ('Simethicone', '40mg', 110, true),
    ('Loperamide', '2mg', 180, true),
    ('Domperidone', '10mg', 150, true),
    ('Artemether', '20mg', 180, true),
    ('Coartem', '20/120mg', 450, true),
    ('Quinine', '300mg', 120, false),
    ('Progesterone', '200mg', 350, true),
    ('Clomiphene', '50mg', 280, true),
    ('Fluoxetine', '20mg', 220, true),
    ('Sertraline', '50mg', 280, false),
    ('Diazepam', '5mg', 150, true)
) AS med_data(medicine_name, strength, price, availability)
CROSS JOIN (
  SELECT id as pharmacy_id, ROW_NUMBER() OVER () as pharmacy_order 
  FROM pharmacies 
  WHERE verified = true 
  ORDER BY name
) pharm
WHERE (med_data.medicine_name || med_data.strength) LIKE '%' 
  AND pharm.pharmacy_order = ((LENGTH(med_data.medicine_name) + LENGTH(med_data.strength)) % 3) + 1;