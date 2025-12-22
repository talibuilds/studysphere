from django.core.management.base import BaseCommand
from api.models import User, StudyGroup, StudySession, GroupMembership, SessionRSVP, Badge


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # Clear existing data
        self.stdout.write('Clearing existing data...')
        Badge.objects.all().delete()
        SessionRSVP.objects.all().delete()
        GroupMembership.objects.all().delete()
        StudySession.objects.all().delete()
        StudyGroup.objects.all().delete()
        User.objects.all().delete()
        
        # Create users
        self.stdout.write('Creating users...')
        
        # Create admin user
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@studysphere.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            xp=5000,
            level=5
        )
        
        # Create regular users
        razan = User.objects.create_user(
            username='razancodes',
            email='razan@example.com',
            password='password123',
            first_name='Muhammed',
            last_name='Razan',
            xp=1250,
            level=3,
            image='https://api.dicebear.com/9.x/avataaars/svg?seed=Henry'
        )
        
        talib = User.objects.create_user(
            username='talibkhan',
            email='talib@example.com',
            password='password123',
            first_name='Talib',
            last_name='Khan',
            xp=620,
            level=2,
            image='https://api.dicebear.com/9.x/avataaars/svg?seed=james'
        )
        
        mayank = User.objects.create_user(
            username='mayank',
            email='mayank@example.com',
            password='password123',
            first_name='Mayank',
            last_name='Mehta',
            xp=890,
            level=2,
            image='https://api.dicebear.com/9.x/avataaars/svg?seed=Human'
        )
        
        muzammil = User.objects.create_user(
            username='muzammil',
            email='muzammil@example.com',
            password='password123',
            first_name='Muzammil',
            last_name='Zahoor',
            xp=750,
            level=2,
            image='https://api.dicebear.com/7.x/avataaars/svg?seed=Rashford'
        )
        
        jensen = User.objects.create_user(
            username='jensen',
            email='jensen@example.com',
            password='password123',
            first_name='Jensen',
            last_name='Huang',
            xp=1120,
            level=3,
            image='https://api.dicebear.com/9.x/avataaars/svg?top=frizzle'
        )
        
        steve = User.objects.create_user(
            username='steve',
            email='steve@example.com',
            password='password123',
            first_name='Steve',
            last_name='Jobs',
            xp=980,
            level=2,
            image='https://api.dicebear.com/7.x/avataaars/svg?seed=Punjab'
        )
        
        # Create study groups (approved)
        self.stdout.write('Creating study groups...')
        
        group1 = StudyGroup.objects.create(
            name='Team StudySphere',
            subject='22CS3AEFWD',
            description='Deep dive into React JS, FASTAPI and Django.',
            creator=razan,
            status='approved'
        )
        GroupMembership.objects.create(user=razan, group=group1)
        GroupMembership.objects.create(user=mayank, group=group1)
        GroupMembership.objects.create(user=muzammil, group=group1)
        
        group2 = StudyGroup.objects.create(
            name='Statistics and Discrete Maths',
            subject='23MA3BSSDM',
            description='Collaborative learning space for probability and stats concepts, problem-solving, and exam prep.',
            creator=talib,
            status='approved'
        )
        GroupMembership.objects.create(user=talib, group=group2)
        GroupMembership.objects.create(user=steve, group=group2)
        
        group3 = StudyGroup.objects.create(
            name='Java Coding Club',
            subject='23CS3PCOOJ',
            description='Led by Faculty Monisha H M for learning developing Java Applications',
            creator=razan,
            status='approved'
        )
        GroupMembership.objects.create(user=razan, group=group3)
        GroupMembership.objects.create(user=jensen, group=group3)
        GroupMembership.objects.create(user=muzammil, group=group3)
        
        group4 = StudyGroup.objects.create(
            name='Data Structures',
            subject='23CS3PCDST',
            description='Explore Data Structures, and How they work together.',
            creator=muzammil,
            status='approved'
        )
        GroupMembership.objects.create(user=muzammil, group=group4)
        GroupMembership.objects.create(user=mayank, group=group4)
        
        group5 = StudyGroup.objects.create(
            name='Machine Learning gang',
            subject='23CS6PCMAL',
            description='Advanced machine learning techniques, neural networks, and AI project discussions.',
            creator=mayank,
            status='approved'
        )
        GroupMembership.objects.create(user=mayank, group=group5)
        GroupMembership.objects.create(user=razan, group=group5)
        GroupMembership.objects.create(user=jensen, group=group5)
        
        # Create pending groups
        StudyGroup.objects.create(
            name='Full stack web dev club',
            subject='22CS3AEFWD',
            description='For students interested in full stack web development',
            creator=muzammil,
            status='pending'
        )
        
        StudyGroup.objects.create(
            name='Java Study Group',
            subject='23CS3PCOOJ',
            description='Collaborative study group for Java fundamentals',
            creator=mayank,
            status='pending'
        )
        
        # Create study sessions
        self.stdout.write('Creating study sessions...')
        
        session1 = StudySession.objects.create(
            title='Full Stack Web Development',
            course_code='22CS3AEFWD',
            description='Join us for an in-depth study of FWD covered in this semester. We\'ll go through React for frontend, Django for backend, FASTAPI for connecting API, and more.',
            date='Wednesday, October 22nd',
            time='8:00 AM - 10:00 AM',
            location='CSE-UG LAB2',
            host=razan,
            group=group1
        )
        SessionRSVP.objects.create(user=razan, session=session1)
        SessionRSVP.objects.create(user=mayank, session=session1)
        SessionRSVP.objects.create(user=muzammil, session=session1)
        SessionRSVP.objects.create(user=jensen, session=session1)
        
        session2 = StudySession.objects.create(
            title='Probability Practice',
            course_code='23MA3BSSDM',
            description='Practice problems for probability and statistics',
            date='October 23',
            time='1:00 PM - 2:00 PM',
            location='Reference Section, 1st Floor PJA Block',
            host=talib,
            group=group2
        )
        SessionRSVP.objects.create(user=talib, session=session2)
        SessionRSVP.objects.create(user=steve, session=session2)
        SessionRSVP.objects.create(user=razan, session=session2)
        
        session3 = StudySession.objects.create(
            title='Java Coding Session (cie-1)',
            course_code='23CS3PCOOJ',
            description='Prepare for CIE-1 with practice coding problems',
            date='October 25',
            time='3:00 PM - 5:00 PM',
            location='CSE Dept, Room 102',
            host=razan,
            group=group3
        )
        SessionRSVP.objects.create(user=razan, session=session3)
        SessionRSVP.objects.create(user=muzammil, session=session3)
        SessionRSVP.objects.create(user=jensen, session=session3)
        
        session4 = StudySession.objects.create(
            title='Computer Architecture Revision',
            course_code='23CS3ESCOA',
            description='Review computer architecture concepts',
            date='October 26',
            time='10:00 AM - 12:00 PM',
            location='CSE-UG LAB1',
            host=muzammil
        )
        SessionRSVP.objects.create(user=muzammil, session=session4)
        SessionRSVP.objects.create(user=mayank, session=session4)
        
        session5 = StudySession.objects.create(
            title='Database Queries Workshop',
            course_code='23CS3PCDBM',
            description='Practice SQL queries and database design',
            date='October 28',
            time='9:00 AM - 11:00 AM',
            location='CSE-UG LAB3',
            host=razan
        )
        SessionRSVP.objects.create(user=razan, session=session5)
        SessionRSVP.objects.create(user=steve, session=session5)
        
        session6 = StudySession.objects.create(
            title='Data Structures & Algorithms Bootcamp',
            course_code='23CS3PCDST',
            description='Intensive DSA practice session',
            date='October 29',
            time='11:00 AM - 1:00 PM',
            location='Reference Section, 2nd Floor PJA Block',
            host=muzammil,
            group=group4
        )
        SessionRSVP.objects.create(user=muzammil, session=session6)
        SessionRSVP.objects.create(user=mayank, session=session6)
        SessionRSVP.objects.create(user=razan, session=session6)
        
        # Create badges
        self.stdout.write('Creating badges...')
        
        Badge.objects.create(
            name='Rising Star',
            icon='Zap',
            color='text-purple-500',
            bg_color='bg-purple-500/20',
            user=razan
        )
        
        Badge.objects.create(
            name='Knowledge Seeker',
            icon='BookOpen',
            color='text-blue-500',
            bg_color='bg-blue-500/20',
            user=jensen
        )
        
        Badge.objects.create(
            name='Team Player',
            icon='Users',
            color='text-green-500',
            bg_color='bg-green-500/20',
            user=steve
        )
        
        Badge.objects.create(
            name='Study Buddy',
            icon='BookOpen',
            color='text-cyan-500',
            bg_color='bg-cyan-500/20',
            user=mayank
        )
        
        Badge.objects.create(
            name='Initiator',
            icon='Zap',
            color='text-yellow-500',
            bg_color='bg-yellow-500/20',
            user=muzammil
        )
        
        Badge.objects.create(
            name='Weekend Warrior',
            icon='Target',
            color='text-red-500',
            bg_color='bg-red-500/20',
            user=talib
        )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
        self.stdout.write(f'Created {User.objects.count()} users')
        self.stdout.write(f'Created {StudyGroup.objects.count()} groups')
        self.stdout.write(f'Created {StudySession.objects.count()} sessions')
        self.stdout.write(f'Created {Badge.objects.count()} badges')
        self.stdout.write('')
        self.stdout.write('Test credentials:')
        self.stdout.write('Admin: admin / admin123')
        self.stdout.write('User: razancodes / password123')
