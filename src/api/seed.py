# src/api/seed.py
"""
Seed script para poblar la base de datos con datos reales de CaliaFarm
"""
from api.models import (
    db, User, Experience, ExperienceSchedule, Room, Extra, Package, PackageExtra,
    UserRole, DayOfWeek, ExtraType
)
from werkzeug.security import generate_password_hash
from datetime import time

def seed_database():
    """Poblar la base de datos con datos iniciales de CaliaFarm"""
    
    print("🌱 Iniciando seed de CaliaFarm...")
    
    # ============= CREAR USUARIO ADMIN =============
    print("👤 Creando usuario admin...")
    admin = User.query.filter_by(email='admin@caliafarm.com').first()
    if not admin:
        admin = User(
            email='admin@caliafarm.com',
            password=generate_password_hash('admin123'),
            name='CaliaFarm Admin',
            phone='+39 123 456 7890',
            role=UserRole.ADMIN,
            is_active=True,
            email_verified=True,
            is_guest=False
        )
        db.session.add(admin)
    
    # ============= CREAR EXPERIENCIAS =============
    print("🍷 Creando experiencias...")
    
    # 1. Full Experience
    full_exp = Experience.query.filter_by(name='Full Experience: Cooking & Dinner + Wine Tasting').first()
    if not full_exp:
        full_exp = Experience(
            name='Full Experience: Cooking & Dinner + Wine Tasting',
            description='Private tours to Sicily\'s finest wineries with exclusive tastings. Learn authentic Sicilian recipes in hands-on cooking classes.',
            price=85.0,
            max_capacity=8,
            duration_hours=6,
            image_url='https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
            is_active=True
        )
        db.session.add(full_exp)
        db.session.flush()
        
        for day in DayOfWeek:
            schedule = ExperienceSchedule(
                experience_id=full_exp.id,
                day_of_week=day,
                start_time=time(10, 0)
            )
            db.session.add(schedule)
    
    # 2. Cooking & Dinner
    cooking_exp = Experience.query.filter_by(name='Cooking & Dinner Experience').first()
    if not cooking_exp:
        cooking_exp = Experience(
            name='Cooking & Dinner Experience',
            description='Visit century-old olive groves and traditional mills to discover Sicily\'s liquid gold.',
            price=65.0,
            max_capacity=8,
            duration_hours=4,
            image_url='https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
            is_active=True
        )
        db.session.add(cooking_exp)
        db.session.flush()
        
        for day in DayOfWeek:
            schedule = ExperienceSchedule(
                experience_id=cooking_exp.id,
                day_of_week=day,
                start_time=time(14, 0)
            )
            db.session.add(schedule)
    
    # 3. Wine Tasting
    wine_exp = Experience.query.filter_by(name='Sicilian Wine Tasting').first()
    if not wine_exp:
        wine_exp = Experience(
            name='Sicilian Wine Tasting',
            description='Learn authentic Sicilian recipes in hands-on cooking classes with local chefs.',
            price=75.0,
            max_capacity=8,
            duration_hours=3,
            image_url='https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
            is_active=True
        )
        db.session.add(wine_exp)
        db.session.flush()
        
        for day in [DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY]:
            schedule = ExperienceSchedule(
                experience_id=wine_exp.id,
                day_of_week=day,
                start_time=time(11, 0)
            )
            db.session.add(schedule)
    
    # ============= CREAR HABITACIONES =============
    print("🏨 Creando habitaciones...")
    
    fico = Room.query.filter_by(name='Fico d\'India').first()
    if not fico:
        fico = Room(
            name='Fico d\'India',
            description='Elegant room with panoramic views and private jacuzzi.',
            capacity=2,
            price_per_night=150.0,
            image_url='https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
            amenities={'jacuzzi': True, 'vineyard_view': True},
            check_in_time=time(15, 0),
            check_out_time=time(10, 0),
            is_active=True
        )
        db.session.add(fico)
    
    ulivo = Room.query.filter_by(name='Ulivo').first()
    if not ulivo:
        ulivo = Room(
            name='Ulivo',
            description='Cozy double room with traditional Sicilian decor.',
            capacity=2,
            price_per_night=100.0,
            image_url='https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
            amenities={'olive_grove_view': True},
            check_in_time=time(15, 0),
            check_out_time=time(10, 0),
            is_active=True
        )
        db.session.add(ulivo)
    
    mandorla = Room.query.filter_by(name='Mandorla').first()
    if not mandorla:
        mandorla = Room(
            name='Mandorla',
            description='Bright and spacious double room with garden views.',
            capacity=2,
            price_per_night=100.0,
            image_url='https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
            amenities={'garden_view': True},
            check_in_time=time(15, 0),
            check_out_time=time(10, 0),
            is_active=True
        )
        db.session.add(mandorla)
    
    vigna = Room.query.filter_by(name='Vigna').first()
    if not vigna:
        vigna = Room(
            name='Vigna',
            description='Spacious triple room perfect for families.',
            capacity=3,
            price_per_night=140.0,
            image_url='https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
            amenities={'vineyard_view': True, 'family_friendly': True},
            check_in_time=time(15, 0),
            check_out_time=time(10, 0),
            is_active=True
        )
        db.session.add(vigna)
    
    # ============= CREAR EXTRAS =============
    print("✨ Creando extras...")
    
    transfer = Extra.query.filter_by(name='Airport Transfer').first()
    if not transfer:
        transfer = Extra(
            name='Airport Transfer',
            description='Private transfer from/to airport',
            price=80.0,
            type=ExtraType.PER_BOOKING,
            is_active=True
        )
        db.session.add(transfer)
    
    breakfast = Extra.query.filter_by(name='Sicilian Breakfast').first()
    if not breakfast:
        breakfast = Extra(
            name='Sicilian Breakfast',
            description='Traditional Sicilian breakfast',
            price=15.0,
            type=ExtraType.PER_GUEST,
            is_active=True
        )
        db.session.add(breakfast)
    
    dinner = Extra.query.filter_by(name='Gourmet Dinner').first()
    if not dinner:
        dinner = Extra(
            name='Gourmet Dinner',
            description='5-course Sicilian dinner with wine',
            price=60.0,
            type=ExtraType.PER_GUEST,
            is_active=True
        )
        db.session.add(dinner)
    
    db.session.commit()
    
    print("✅ Seed completado!")
    print(f"Experiencias: {Experience.query.count()}")
    print(f"Habitaciones: {Room.query.count()}")
    print(f"Extras: {Extra.query.count()}")
    print("\nAdmin: admin@caliafarm.com / admin123")

if __name__ == '__main__':
    from app import app
    with app.app_context():
        seed_database()