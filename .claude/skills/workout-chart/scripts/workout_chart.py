#!/usr/bin/env python3
"""
Query the database for workout entries from the past year and plot a bar chart.
Usage: python workout_chart.py [--output <path>] [--env <.env path>]
"""

import argparse
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path


def load_env(env_path: str) -> str:
    """Parse DATABASE_URL from a .env file."""
    path = Path(env_path)
    if not path.exists():
        raise FileNotFoundError(f".env file not found at: {env_path}")

    with open(path) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL"):
                _, _, value = line.partition("=")
                return value.strip().strip('"').strip("'")

    raise ValueError("DATABASE_URL not found in .env file")


def query_workouts(database_url: str) -> dict[str, int]:
    """Query workouts from the past year, grouped by month. Returns {YYYY-MM: count}."""
    try:
        import psycopg2
    except ImportError:
        print("psycopg2 not installed. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary", "-q"])
        import psycopg2

    one_year_ago = datetime.now() - timedelta(days=365)

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    TO_CHAR(started_at, 'YYYY-MM') AS month,
                    COUNT(*) AS workout_count
                FROM workouts
                WHERE started_at >= %s
                GROUP BY month
                ORDER BY month
                """,
                (one_year_ago,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    return {row[0]: row[1] for row in rows}


def fill_missing_months(data: dict[str, int]) -> tuple[list[str], list[int]]:
    """Fill in zero-count months so the chart has no gaps."""
    if not data:
        # Generate last 12 months with zeros
        now = datetime.now()
        months = []
        for i in range(11, -1, -1):
            d = now - timedelta(days=30 * i)
            months.append(d.strftime("%Y-%m"))
        return months, [0] * 12

    # Build a complete range from the earliest month to now
    min_month = min(data.keys())
    now = datetime.now()
    current = datetime.strptime(min_month, "%Y-%m")
    end = datetime(now.year, now.month, 1)

    months = []
    while current <= end:
        months.append(current.strftime("%Y-%m"))
        # Advance one month
        if current.month == 12:
            current = current.replace(year=current.year + 1, month=1)
        else:
            current = current.replace(month=current.month + 1)

    counts = [data.get(m, 0) for m in months]
    return months, counts


def plot_chart(months: list[str], counts: list[int], output_path: str) -> None:
    """Render and save the bar chart."""
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib not installed. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "matplotlib", "-q"])
        import matplotlib.pyplot as plt

    # Use abbreviated month labels (e.g. Jan '25)
    labels = []
    for m in months:
        dt = datetime.strptime(m, "%Y-%m")
        labels.append(dt.strftime("%b '%y"))

    fig, ax = plt.subplots(figsize=(max(10, len(months) * 0.9), 6))

    bars = ax.bar(labels, counts, color="#4F86C6", edgecolor="white", linewidth=0.5)

    # Annotate each bar with its count
    for bar, count in zip(bars, counts):
        if count > 0:
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 0.1,
                str(count),
                ha="center",
                va="bottom",
                fontsize=9,
                color="#333333",
            )

    ax.set_xlabel("Month", fontsize=12, labelpad=10)
    ax.set_ylabel("Number of Workouts", fontsize=12, labelpad=10)
    ax.set_title("Workouts Per Month (Past Year)", fontsize=14, fontweight="bold", pad=15)
    ax.yaxis.get_major_locator().set_params(integer=True)
    ax.set_ylim(0, max(counts) * 1.2 + 1 if counts else 5)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()

    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    print(f"Chart saved to: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a workout frequency bar chart.")
    parser.add_argument(
        "--output",
        default="workout_chart.png",
        help="Output image path (default: workout_chart.png)",
    )
    parser.add_argument(
        "--env",
        default=".env",
        help="Path to the .env file (default: .env)",
    )
    args = parser.parse_args()

    print("Loading DATABASE_URL...")
    database_url = load_env(args.env)

    print("Querying workouts from the past year...")
    raw_data = query_workouts(database_url)

    if not raw_data:
        print("No workouts found in the past year.")
    else:
        total = sum(raw_data.values())
        print(f"Found {total} workouts across {len(raw_data)} month(s).")

    months, counts = fill_missing_months(raw_data)

    print("Generating chart...")
    plot_chart(months, counts, args.output)


if __name__ == "__main__":
    main()
