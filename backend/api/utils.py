"""Utility functions for XP and leveling system"""


def calculate_level(xp):
    """Calculate level based on XP (every 500 XP = 1 level)"""
    if xp < 500:
        return 1
    elif xp < 1000:
        return 2
    elif xp < 1500:
        return 3
    elif xp < 2000:
        return 4
    else:
        return 5 + (xp - 2000) // 1000


def award_xp(user, amount):
    """Award XP to a user and update their level"""
    user.xp += amount
    user.level = calculate_level(user.xp)
    user.save()
    return user


# XP rewards for different actions
XP_REWARDS = {
    'create_session': 50,
    'rsvp_session': 10,
    'join_group': 25,
    'create_group': 30,
}
