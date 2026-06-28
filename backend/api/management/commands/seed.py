from django.core.management.base import BaseCommand
from api.models import User, StudyGroup, StudySession, GroupMembership, SessionRSVP, Badge
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Seed database with robust sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database with robust data...')
        
        # Clear existing data
        self.stdout.write('Clearing existing data...')
        Badge.objects.all().delete()
        SessionRSVP.objects.all().delete()
        GroupMembership.objects.all().delete()
        StudySession.objects.all().delete()
        StudyGroup.objects.all().delete()
        User.objects.all().delete()
        
        # 1. CREATE USERS
        self.stdout.write('Creating users...')
        
        admin = User.objects.create_superuser('admin', 'admin@studysphere.com', 'admin123', first_name='Admin', last_name='User', xp=5000, level=5)
        
        users_data = [
            ('razancodes', 'password123', 'Muhammed', 'Razan', 1250, 3, 'Henry'),
            ('talibkhan', 'password123', 'Talib', 'Khan', 620, 2, 'james'),
            ('mayank', 'password123', 'Mayank', 'Mehta', 890, 2, 'Human'),
            ('muzammil', 'password123', 'Muzammil', 'Zahoor', 750, 2, 'Rashford'),
            ('jensen', 'password123', 'Jensen', 'Huang', 1120, 3, 'frizzle'),
            ('steve', 'password123', 'Steve', 'Jobs', 980, 2, 'Punjab'),
            ('sarahd', 'password123', 'Sarah', 'Davis', 1400, 4, 'Sarah'),
            ('mikew', 'password123', 'Michael', 'Wilson', 300, 1, 'Mike'),
            ('emmaj', 'password123', 'Emma', 'Johnson', 2100, 5, 'Emma'),
            ('davidb', 'password123', 'David', 'Brown', 850, 2, 'David'),
            ('lisam', 'password123', 'Lisa', 'Miller', 1100, 3, 'Lisa'),
            ('robertg', 'password123', 'Robert', 'Garcia', 450, 1, 'Robert')
        ]
        
        user_objs = {}
        for u in users_data:
            user_objs[u[0]] = User.objects.create_user(
                username=u[0], password=u[1], first_name=u[2], last_name=u[3], 
                xp=u[4], level=u[5], image=f'https://api.dicebear.com/9.x/avataaars/svg?seed={u[6]}'
            )

        # 2. CREATE STUDY GROUPS
        self.stdout.write('Creating study groups...')
        
        groups_data = [
            ('Full Stack Web Dev', '22CS3AEFWD', 'Deep dive into React JS, FASTAPI and Django.', 'code', 'razancodes', ['mayank', 'muzammil', 'sarahd', 'emmaj']),
            ('Data Science & Analytics', '23CS4PCDSA', 'Data analysis, pandas, numpy, and visualization.', 'pie-chart', 'emmaj', ['davidb', 'lisam', 'mikew', 'steve']),
            ('Cyber Security Club', '23CS5PECYB', 'Ethical hacking, network security, and cryptography.', 'shield', 'sarahd', ['robertg', 'talibkhan', 'jensen']),
            ('AI & Machine Learning', '23CS6PCMAL', 'Neural networks, PyTorch, TensorFlow and AI models.', 'monitor', 'mayank', ['razancodes', 'jensen', 'sarahd', 'lisam']),
            ('UI/UX Design Society', '23CS4PEUIX', 'Figma, user research, wireframing, and prototyping.', 'pen-tool', 'lisam', ['emmaj', 'robertg', 'talibkhan']),
            ('Math Wizards', '23MA3BSSDM', 'Probability, statistics, and discrete mathematics.', 'book-open', 'talibkhan', ['steve', 'davidb', 'muzammil']),
            ('Cloud Computing', '23CS7PECLD', 'AWS, Docker, Kubernetes, and serverless architecture.', 'cloud', 'jensen', ['sarahd', 'razancodes', 'mikew']),
            ('Java & Algorithms', '23CS3PCOOJ', 'Object-oriented programming and advanced DSA in Java.', 'code', 'muzammil', ['mayank', 'jensen', 'robertg'])
        ]
        
        group_objs = {}
        for g in groups_data:
            group = StudyGroup.objects.create(
                name=g[0], subject=g[1], description=g[2], icon=g[3],
                creator=user_objs[g[4]], status='approved'
            )
            group_objs[g[0]] = group
            GroupMembership.objects.create(user=user_objs[g[4]], group=group) # Creator joins
            for member in g[5]:
                GroupMembership.objects.create(user=user_objs[member], group=group)

        # 3. CREATE STUDY SESSIONS
        self.stdout.write('Creating study sessions...')
        
        today = datetime.now()
        dates = {
            'today': today.strftime("%A, %B %d"),
            'tomorrow': (today + timedelta(days=1)).strftime("%A, %B %d"),
            'next_week': (today + timedelta(days=7)).strftime("%A, %B %d"),
        }

        sessions_data = [
            ('React Context API Deep Dive', '22CS3AEFWD', 'Understanding state management with React Context API and hooks.', dates['today'], '2:00 PM - 4:00 PM', 'CSE-UG LAB2', 'razancodes', 'Full Stack Web Dev', ['mayank', 'emmaj']),
            ('Pandas Crash Course', '23CS4PCDSA', 'Data cleaning and preparation using Python Pandas library.', dates['tomorrow'], '10:00 AM - 12:00 PM', 'Reference Section, Library', 'emmaj', 'Data Science & Analytics', ['steve', 'mikew']),
            ('Intro to Cryptography', '23CS5PECYB', 'Symmetric and asymmetric encryption basics.', dates['next_week'], '3:00 PM - 5:00 PM', 'PJA Block, Room 302', 'sarahd', 'Cyber Security Club', ['talibkhan', 'jensen', 'robertg']),
            ('Building Neural Networks', '23CS6PCMAL', 'Hands-on session building a simple neural network from scratch.', dates['today'], '5:00 PM - 7:00 PM', 'CSE-UG LAB1', 'mayank', 'AI & Machine Learning', ['razancodes', 'lisam']),
            ('Figma Prototyping Workshop', '23CS4PEUIX', 'Interactive prototyping and animations in Figma.', dates['tomorrow'], '1:00 PM - 3:00 PM', 'Design Studio, Arch Block', 'lisam', 'UI/UX Design Society', ['emmaj', 'talibkhan']),
            ('Probability Distributions', '23MA3BSSDM', 'Normal, Binomial, and Poisson distributions.', dates['next_week'], '9:00 AM - 11:00 AM', 'PJA Block, Room 104', 'talibkhan', 'Math Wizards', ['steve', 'davidb']),
            ('Docker for Beginners', '23CS7PECLD', 'Containerization concepts and writing your first Dockerfile.', dates['today'], '11:00 AM - 1:00 PM', 'CSE-UG LAB3', 'jensen', 'Cloud Computing', ['razancodes', 'sarahd']),
            ('Graphs and Trees', '23CS3PCOOJ', 'Graph traversal algorithms (BFS, DFS) in Java.', dates['tomorrow'], '4:00 PM - 6:00 PM', 'CSE-UG LAB2', 'muzammil', 'Java & Algorithms', ['mayank', 'robertg']),
            ('Portfolio Review', '23CS4PEUIX', 'Bring your UI/UX portfolios for peer feedback.', dates['next_week'], '2:00 PM - 4:00 PM', 'Design Studio, Arch Block', 'lisam', 'UI/UX Design Society', ['robertg']),
            ('Next.js App Router', '22CS3AEFWD', 'Migrating from pages to app router in Next.js.', dates['tomorrow'], '6:00 PM - 8:00 PM', 'Virtual (Google Meet)', 'emmaj', 'Full Stack Web Dev', ['razancodes', 'muzammil', 'sarahd'])
        ]

        for s in sessions_data:
            session = StudySession.objects.create(
                title=s[0], course_code=s[1], description=s[2], date=s[3], time=s[4],
                location=s[5], host=user_objs[s[6]], group=group_objs[s[7]]
            )
            SessionRSVP.objects.create(user=user_objs[s[6]], session=session) # Host RSVPs automatically
            for attendee in s[8]:
                SessionRSVP.objects.create(user=user_objs[attendee], session=session)

        # 4. CREATE BADGES
        self.stdout.write('Creating badges...')
        
        badges_data = [
            ('Rising Star', 'Zap', 'text-purple-500', 'bg-purple-500/20', ['razancodes', 'lisam', 'davidb']),
            ('Knowledge Seeker', 'BookOpen', 'text-blue-500', 'bg-blue-500/20', ['jensen', 'emmaj']),
            ('Team Player', 'Users', 'text-green-500', 'bg-green-500/20', ['steve', 'sarahd']),
            ('Study Buddy', 'BookOpen', 'text-cyan-500', 'bg-cyan-500/20', ['mayank', 'muzammil']),
            ('Weekend Warrior', 'Target', 'text-red-500', 'bg-red-500/20', ['talibkhan', 'robertg', 'mikew'])
        ]

        for b in badges_data:
            for username in b[4]:
                Badge.objects.create(
                    name=b[0], icon=b[1], color=b[2], bg_color=b[3], user=user_objs[username]
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with rich data!'))
        self.stdout.write(f'Created {User.objects.count()} users')
        self.stdout.write(f'Created {StudyGroup.objects.count()} groups')
        self.stdout.write(f'Created {StudySession.objects.count()} sessions')
        self.stdout.write(f'Created {Badge.objects.count()} badges')
