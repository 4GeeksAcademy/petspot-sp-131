import subprocess
import sys


COMMANDS = [
    ["pipenv", "run", "flask", "insert-cities"],
    ["pipenv", "run", "flask", "insert-test-users-with-location", "5"],
    ["pipenv", "run", "flask", "insert-test-places", "5"],
    ["pipenv", "run", "flask", "insert-test-admins", "3"],
    ["pipenv", "run", "flask", "insert-external-races"],
    ["pipenv", "run", "flask", "insert-test-pets", "10"],
    ["pipenv", "run", "flask", "insert-test-favorites", "10"],
    ["pipenv", "run", "flask", "insert-test-reservations", "30"],
    ["pipenv", "run", "flask", "insert-test-reviews", "15"],
    ["pipenv", "run", "flask", "insert-test-chat", "10"],
    ["pipenv", "run", "flask", "insert-test-news"],
]


def main():
    for command in COMMANDS:
        print(f"Running: {' '.join(command)}")
        result = subprocess.run(command, check=False)

        if result.returncode != 0:
            print(f"Command failed with exit code {result.returncode}: {' '.join(command)}")
            sys.exit(result.returncode)

    print("All seed commands completed successfully.")


if __name__ == "__main__":
    main()
