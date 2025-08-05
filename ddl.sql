CREATE DATABASE clothcrafters;
USE clothcrafters;

CREATE TABLE users(
 user_id INT UNIQUE AUTO_INCREMENT,          
    username VARCHAR(50) NOT NULL,                   
    email VARCHAR(100) PRIMARY KEY NOT NULL,              
    password VARCHAR(255) NOT NULL,                  
    phone_number VARCHAR(15),                        
    address TEXT,                                    
    profile_image_url VARCHAR(255),                  
    user_type ENUM('User', 'Tailor', 'Boutique') NOT NULL  
);

CREATE TABLE Measurements(
measurement_id INT PRIMARY KEY AUTO_INCREMENT,
email VARCHAR(50),
chest_size FLOAT,
waist_size FLOAT,
hip_size FLOAT,
height FLOAT,
shoulder_width FLOAT,
FOREIGN KEY (email) REFERENCES users (email) 
);

CREATE TABLE alter_clothes (
    alter_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50),
    category VARCHAR(50),
    image_path VARCHAR(255),
    description TEXT,
    FOREIGN KEY (email) REFERENCES users (email)
);




CREATE TABLE customize_clothes(
customize_id INT PRIMARY KEY AUTO_INCREMENT,
email VARCHAR(50),
category VARCHAR(50),
image_path VARCHAR(255),
design_inspiration TEXT,
FOREIGN KEY (email) REFERENCES users (email)
);


CREATE TABLE fabric(
   fabric_id INT PRIMARY KEY AUTO_INCREMENT,
   name VARCHAR(50),
   email VARCHAR(50) DEFAULT NULL,
   cost INT,
   decription TEXT,
   image VARCHAR(2000),
   FOREIGN KEY (email) REFERENCES users (email)
);

INSERT INTO fabric (name, cost, decription, image)
VALUES 
('Cotton', 500, 'Cotton is a soft and breathable natural fiber.', 'https://a.storyblok.com/f/165154/1456x816/c0fa2fe609/02_-cotton-fabric.png/m/1000x0/'),
('Synthetic', 400, 'Synthetic fabric, often used for its elasticity and durability.', 'https://a.storyblok.com/f/165154/1456x816/1ee882a66e/03_spandex-fabric.png/m/1000x0/'),
('Semi-synthetic', 450, 'Semi-synthetic fabrics combine natural and synthetic fibers.', 'https://a.storyblok.com/f/165154/1456x816/ef3e5037c9/04_microfiber-fabric.png/m/1000x0/'),
('Blended fabrics', 600, 'Blended fabrics, such as polyester-cotton blends, provide combined qualities of both materials.', 'https://a.storyblok.com/f/165154/1456x816/529b44f06e/05_polyester-cotton-blend.png/m/1000x0/'),
('Woven fabric', 550, 'Woven fabrics are made using a weaving technique, offering durability and structure.', 'https://a.storyblok.com/f/165154/1456x816/dcbf384ee8/06_twill-weave-fabric.png/m/1000x0/'),
('Canvas', 700, 'Canvas fabric is heavy-duty and used for a variety of purposes, including art and upholstery.', 'https://a.storyblok.com/f/165154/1456x816/551974e5b5/07_tulle_fabric.png/m/1000x0/');

CREATE TABLE Products(
product_id INT PRIMARY KEY AUTO_INCREMENT,
   name VARCHAR(50),
   email VARCHAR(50) DEFAULT NULL,
   cost INT,
   decription TEXT,
   image VARCHAR(2000),
   FOREIGN KEY (email) REFERENCES users (email)
);


INSERT INTO Products (name, cost, decription, image)
VALUES 
('Shirt', 1200, 'Best seller winter shirt with a stylish print.', 'https://image.made-in-china.com/202f0j00OqphHoJRnlub/Best-Seller-Winter-Shirt-Print-Check-Shirts-for-Men.webp'),
('Pants', 800, 'Comfortable and fashionable pants for everyday wear.', 'https://www.lornajane.com.au/dw/image/v2/BDXV_PRD/on/demandware.static/-/Sites-lornajane-master/default/dw61f990ca/images/052411/052411_WLNT_8_PRODUCT.jpg?sw=308&sh=433&q=90&strip=true'),
('Skirt', 600, 'Light and breezy skirt ideal for summer.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFJg67Kbo5umJcg7jvI3wCTZUBNcSbA6hhsQ&s'),
('Formal Suit', 3000, 'Elegant formal suit suitable for business or events.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP9nHphx1diEYRy4UgkDNmhbZTRT3vOOO2iA&s'),
('Traditional Saree', 2500, 'Beautiful traditional saree with intricate designs.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9YbMTbbgwx8EM2arbe_SuuAeiDmed3XWSSw&s'),
('Kurta/Kurti', 1500, 'Stylish kurta/kurti with elegant patterns.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCBftA58vb2aTJotg4Wb07_dAIeZLq8sZ1ug&s'),
('Casual Top', 700, 'Casual top suitable for everyday wear.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRV033tmtUUx10pS3a8uGD5qYcXO2AQnUJjw&s'),
('Jacket', 2000, 'Trendy jacket that complements any outfit.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5CJGgk2_kwgubltX9wyqK35JJ5NP_CNe6jQ&s');

CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50),
    fabric_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    FOREIGN KEY (email) REFERENCES users(email),
    FOREIGN KEY (fabric_id) REFERENCES fabric(fabric_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

CREATE TABLE Vacancy(
	Vacancy_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50),
    FOREIGN KEY (email) REFERENCES users (email),
    phone_number VARCHAR(15) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    salary_offered FLOAT,
    working_hours VARCHAR(30)
);

CREATE TABLE Applications(
name VARCHAR(30) DEFAULT NULL,
phone_number VARCHAR(15) DEFAULT NULL,
Vacancy_id INT,
FOREIGN KEY (Vacancy_id) REFERENCES Vacancy (Vacancy_id),
email VARCHAR(50),
FOREIGN KEY (email) REFERENCES users (email),
address TEXT DEFAULT NULL,
status ENUM ('In Reveiew','Accepted','Rejected')
);


ALTER TABLE Applications MODIFY status ENUM('In Review','Accepted','Rejected');
ALTER TABLE Applications DROP FOREIGN KEY applications_ibfk_1;
ALTER TABLE Applications
ADD CONSTRAINT applications_ibfk_1
FOREIGN KEY (Vacancy_id) REFERENCES Vacancy(Vacancy_id) ON DELETE CASCADE;






ALTER TABLE Applications MODIFY status ENUM('In Review','Accepted','Rejected');