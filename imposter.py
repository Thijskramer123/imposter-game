#!/usr/bin/env python3
"""
Who is the Imposter? - A terminal-based party game.

Pass a single laptop around and try to figure out who the imposter is!
Civilians all know the secret word. Imposters must bluff their way through.
"""

import os
import random
import sys

try:
    from colorama import init, Fore, Style
    init(autoreset=True)
except ImportError:
    print("colorama is required. Install it with: pip install colorama")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Word lists — at least 10 words per category
# ---------------------------------------------------------------------------
WORD_LISTS = {
    "Animals": [
        "Elephant", "Penguin", "Giraffe", "Dolphin", "Chameleon",
        "Kangaroo", "Octopus", "Flamingo", "Hedgehog", "Panther",
        "Koala", "Cheetah",
    ],
    "Food": [
        "Sushi", "Pancake", "Burrito", "Croissant", "Dumpling",
        "Lasagna", "Pretzel", "Waffle", "Tiramisu", "Falafel",
        "Ramen", "Guacamole",
    ],
    "Sports": [
        "Basketball", "Cricket", "Fencing", "Surfing", "Archery",
        "Badminton", "Hockey", "Volleyball", "Gymnastics", "Boxing",
        "Rowing", "Skateboarding",
    ],
    "Places": [
        "Library", "Volcano", "Lighthouse", "Castle", "Aquarium",
        "Pyramid", "Rainforest", "Glacier", "Colosseum", "Waterfall",
        "Carnival", "Observatory",
    ],
    "Movies": [
        "Inception", "Titanic", "Jaws", "Frozen", "Gladiator",
        "Shrek", "Psycho", "Avatar", "Ratatouille", "Interstellar",
        "Rocky", "Bambi",
    ],
    "Occupations": [
        "Astronaut", "Detective", "Blacksmith", "Pilot", "Surgeon",
        "Librarian", "Magician", "Firefighter", "Archaeologist", "Chef",
        "Electrician", "Journalist",
    ],
}

TITLE_ART = r"""
{red}
  ██╗    ██╗██╗  ██╗ ██████╗     ██╗███████╗    ████████╗██╗  ██╗███████╗
  ██║    ██║██║  ██║██╔═══██╗    ██║██╔════╝    ╚══██╔══╝██║  ██║██╔════╝
  ██║ █╗ ██║███████║██║   ██║    ██║███████╗       ██║   ███████║█████╗
  ██║███╗██║██╔══██║██║   ██║    ██║╚════██║       ██║   ██╔══██║██╔══╝
  ╚███╔███╔╝██║  ██║╚██████╔╝    ██║███████║       ██║   ██║  ██║███████╗
   ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝     ╚═╝╚══════╝       ╚═╝   ╚═╝  ╚═╝╚══════╝
{yellow}
  ██╗███╗   ███╗██████╗  ██████╗ ███████╗████████╗███████╗██████╗ ██████╗
  ██║████╗ ████║██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗╚════██╗
  ██║██╔████╔██║██████╔╝██║   ██║███████╗   ██║   █████╗  ██████╔╝  ▄███╔╝
  ██║██║╚██╔╝██║██╔═══╝ ██║   ██║╚════██║   ██║   ██╔══╝  ██╔══██╗  ▀▀══╝
  ██║██║ ╚═╝ ██║██║     ╚██████╔╝███████║   ██║   ███████╗██║  ██║  ██╗
  ╚═╝╚═╝     ╚═╝╚═╝      ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝  ╚═╝
{reset}"""


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def clear_screen():
    """Clear the terminal screen."""
    os.system("cls" if os.name == "nt" else "clear")


def pause(msg="Press Enter to continue..."):
    """Wait for the player to press Enter."""
    input(f"\n{Style.DIM}{msg}{Style.RESET_ALL}")


def get_int(prompt, minimum=None, maximum=None):
    """Prompt for an integer within an optional range, looping until valid."""
    while True:
        try:
            value = int(input(prompt))
        except ValueError:
            print(f"{Fore.RED}Please enter a valid number.{Style.RESET_ALL}")
            continue
        if minimum is not None and value < minimum:
            print(f"{Fore.RED}Must be at least {minimum}.{Style.RESET_ALL}")
            continue
        if maximum is not None and value > maximum:
            print(f"{Fore.RED}Must be at most {maximum}.{Style.RESET_ALL}")
            continue
        return value


# ---------------------------------------------------------------------------
# Game phases
# ---------------------------------------------------------------------------

def show_title():
    """Display the title screen with ASCII art."""
    clear_screen()
    print(TITLE_ART.format(
        red=Fore.RED,
        yellow=Fore.YELLOW,
        reset=Style.RESET_ALL,
    ))
    print(f"  {Style.BRIGHT}A party game of bluffing and deduction!{Style.RESET_ALL}")
    print(f"  {Style.DIM}Pass the laptop around — don't peek!{Style.RESET_ALL}\n")


def setup_round():
    """
    Ask for player count & imposter count.
    Returns (num_players, num_imposters).
    """
    print(f"{Fore.CYAN}{Style.BRIGHT}=== GAME SETUP ==={Style.RESET_ALL}\n")
    num_players = get_int(
        f"  How many players? {Style.DIM}(min 3){Style.RESET_ALL}: ",
        minimum=3,
    )
    max_imposters = num_players - 2  # always more civilians than imposters
    num_imposters = get_int(
        f"  How many imposters? {Style.DIM}(1–{max_imposters}){Style.RESET_ALL}: ",
        minimum=1,
        maximum=max_imposters,
    )
    return num_players, num_imposters


def assign_roles(num_players, num_imposters):
    """
    Randomly pick imposters and a secret word.
    Returns (roles, category, word) where roles is a list of booleans
    (True = imposter).
    """
    category = random.choice(list(WORD_LISTS.keys()))
    word = random.choice(WORD_LISTS[category])

    imposter_indices = set(random.sample(range(num_players), num_imposters))
    roles = [i in imposter_indices for i in range(num_players)]
    return roles, category, word


def reveal_phase(roles, category, word):
    """
    One by one, let each player see their role in private.
    """
    num_players = len(roles)
    for i in range(num_players):
        clear_screen()
        print(f"\n{Fore.CYAN}{Style.BRIGHT}  Player {i + 1}'s turn{Style.RESET_ALL}")
        pause("  Press Enter to reveal your role...")

        if roles[i]:
            # Imposter
            print(f"\n  {Fore.RED}{Style.BRIGHT}"
                  f"  YOU ARE THE IMPOSTER! \U0001f575\ufe0f{Style.RESET_ALL}")
            print(f"  {Fore.RED}The category is: {category}{Style.RESET_ALL}")
            print(f"  {Fore.RED}You do NOT know the word. Bluff!{Style.RESET_ALL}")
        else:
            # Civilian
            print(f"\n  {Fore.GREEN}{Style.BRIGHT}"
                  f"  You are a CIVILIAN.{Style.RESET_ALL}")
            print(f"  {Fore.GREEN}Category : {category}{Style.RESET_ALL}")
            print(f"  {Fore.GREEN}Your word : {Style.BRIGHT}{word}{Style.RESET_ALL}")

        pause("  Memorised? Press Enter to clear the screen...")

    clear_screen()
    print(f"\n{Fore.YELLOW}{Style.BRIGHT}"
          f"  All players have seen their roles!{Style.RESET_ALL}\n")


def discussion_phase(num_players):
    """
    Prompt players to discuss and give clues.
    """
    print(f"{Fore.CYAN}{Style.BRIGHT}=== DISCUSSION ROUND ==={Style.RESET_ALL}\n")
    print(f"  Each player should give a {Style.BRIGHT}one-word clue{Style.RESET_ALL} "
          f"about the secret word.")
    print(f"  {Fore.YELLOW}Imposters:{Style.RESET_ALL} bluff convincingly!")
    print(f"  {Fore.GREEN}Civilians:{Style.RESET_ALL} hint without giving it away!\n")
    print(f"  Go around the group. Discuss, argue, and accuse!\n")
    pause("  When everyone is done discussing, press Enter to start voting...")


def voting_phase(num_players):
    """
    Each player votes for who they think is the imposter.
    Returns a list of vote counts per player index and a dict of who voted for whom.
    """
    clear_screen()
    print(f"\n{Fore.CYAN}{Style.BRIGHT}=== VOTING ROUND ==={Style.RESET_ALL}\n")
    print(f"  Each player will vote for who they think is an imposter.")
    print(f"  You {Style.BRIGHT}cannot{Style.RESET_ALL} vote for yourself.\n")

    votes = [0] * num_players  # tally per player
    voter_choices = {}  # voter index -> voted-for index

    for i in range(num_players):
        while True:
            raw = input(
                f"  Player {i + 1}, vote for a player (1–{num_players}): "
            )
            try:
                target = int(raw)
            except ValueError:
                print(f"  {Fore.RED}Enter a number.{Style.RESET_ALL}")
                continue
            if target < 1 or target > num_players:
                print(f"  {Fore.RED}Choose a player between 1 and {num_players}.{Style.RESET_ALL}")
                continue
            if target == i + 1:
                print(f"  {Fore.RED}You can't vote for yourself!{Style.RESET_ALL}")
                continue
            votes[target - 1] += 1
            voter_choices[i] = target - 1
            break

    return votes, voter_choices


def resolve_votes(votes, roles, category, word, scores):
    """
    Announce results, reveal imposters, update scores.
    Returns updated scores dict.
    """
    num_players = len(roles)
    max_votes = max(votes)
    accused = [i for i in range(num_players) if votes[i] == max_votes]

    clear_screen()
    print(f"\n{Fore.CYAN}{Style.BRIGHT}=== RESULTS ==={Style.RESET_ALL}\n")

    # Print vote tally
    print(f"  {Style.BRIGHT}Vote tally:{Style.RESET_ALL}")
    for i in range(num_players):
        bar = "\u2588" * votes[i]
        label = f"Player {i + 1}"
        print(f"    {label:<12} {votes[i]:>2} vote(s)  {Fore.YELLOW}{bar}{Style.RESET_ALL}")
    print()

    # Handle tie
    if len(accused) > 1:
        names = ", ".join(f"Player {a + 1}" for a in accused)
        print(f"  {Fore.YELLOW}{Style.BRIGHT}It's a tie between {names}!{Style.RESET_ALL}")
        print(f"  {Fore.YELLOW}No one is eliminated. The imposters survive!{Style.RESET_ALL}\n")
        caught_imposter = False
    else:
        target = accused[0]
        if roles[target]:
            print(f"  {Fore.GREEN}{Style.BRIGHT}"
                  f"  Player {target + 1} was voted out — "
                  f"and they WERE an imposter!{Style.RESET_ALL}\n")
            caught_imposter = True
        else:
            print(f"  {Fore.RED}{Style.BRIGHT}"
                  f"  Player {target + 1} was voted out — "
                  f"but they were INNOCENT!{Style.RESET_ALL}\n")
            caught_imposter = False

    # Reveal all imposters
    imposter_nums = [str(i + 1) for i in range(num_players) if roles[i]]
    civilian_nums = [str(i + 1) for i in range(num_players) if not roles[i]]
    print(f"  {Fore.RED}Imposter(s): Player {', '.join(imposter_nums)}{Style.RESET_ALL}")
    print(f"  {Fore.GREEN}Civilians  : Player {', '.join(civilian_nums)}{Style.RESET_ALL}")
    print(f"\n  {Fore.CYAN}Category: {Style.BRIGHT}{category}{Style.RESET_ALL}")
    print(f"  {Fore.CYAN}The word was: {Style.BRIGHT}{word}{Style.RESET_ALL}\n")

    # Scoring
    if caught_imposter:
        for i in range(num_players):
            if not roles[i]:
                scores[i] = scores.get(i, 0) + 1
        print(f"  {Fore.GREEN}+1 point to all civilians for catching an imposter!{Style.RESET_ALL}")
    else:
        for i in range(num_players):
            if roles[i]:
                scores[i] = scores.get(i, 0) + 1
        print(f"  {Fore.RED}+1 point to the imposter(s) for surviving!{Style.RESET_ALL}")

    return scores


def show_scoreboard(scores, num_players):
    """Display the running scoreboard."""
    print(f"\n{Fore.CYAN}{Style.BRIGHT}=== SCOREBOARD ==={Style.RESET_ALL}\n")
    ranking = sorted(range(num_players), key=lambda i: scores.get(i, 0), reverse=True)
    for rank, i in enumerate(ranking, 1):
        pts = scores.get(i, 0)
        bar = "\u2605" * pts if pts else "-"
        print(f"    {rank}. Player {i + 1:<4}  {pts:>3} pts  {Fore.YELLOW}{bar}{Style.RESET_ALL}")
    print()


# ---------------------------------------------------------------------------
# Main game loop
# ---------------------------------------------------------------------------

def main():
    scores = {}
    num_players = 0
    first_round = True

    while True:
        show_title()

        if first_round:
            num_players, num_imposters = setup_round()
            first_round = False
        else:
            show_scoreboard(scores, num_players)
            print(f"  {Style.BRIGHT}Play again with the same group?{Style.RESET_ALL}")
            print(f"    1) Same players & imposter count")
            print(f"    2) Change number of imposters")
            print(f"    3) New game (reset everything)")
            print(f"    4) Quit\n")
            choice = input("  Choice: ").strip()
            if choice == "2":
                max_imp = num_players - 2
                num_imposters = get_int(
                    f"  How many imposters? {Style.DIM}(1–{max_imp}){Style.RESET_ALL}: ",
                    minimum=1,
                    maximum=max_imp,
                )
            elif choice == "3":
                scores = {}
                num_players, num_imposters = setup_round()
            elif choice == "4":
                clear_screen()
                print(f"\n{Fore.YELLOW}{Style.BRIGHT}  Thanks for playing! Goodbye.\n{Style.RESET_ALL}")
                break
            # choice == "1" or anything else → keep going

        # --- Run a round ---
        roles, category, word = assign_roles(num_players, num_imposters)
        reveal_phase(roles, category, word)
        discussion_phase(num_players)
        votes, _ = voting_phase(num_players)
        scores = resolve_votes(votes, roles, category, word, scores)
        show_scoreboard(scores, num_players)
        pause("Press Enter to return to the menu...")


if __name__ == "__main__":
    main()
