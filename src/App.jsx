import React, { useState, useEffect } from "react";

const PLAYERS = [
  "Scott Jr",
  "Scott Sr",
  "Georgia",
  "Irene",
  "Claire",
  "Ryan"
];

const SQUARES = [
  "Elvis Impersonator",
  "Bride In Wedding Dress",
  "Bachelor Party",
  "Bachelorette Party",
  "Someone Drinking Before 9am",
  "Hear Mr Brightside",
  "Limousine",
  "Influencer Filming",
  "Someone Crying",
  "Celebrity Sighting",
  "Lost Tourist",
  "Proposal",
  "Uber Queue Chaos",
  "Lamborghini",
  "Casino Carpet Photo",
  "Dog Wearing Clothes",
  "Mobility Scooter",
  "Rolls Royce",
  "Carrying Shoes",
  "What Happens In Vegas",
  "Security Escort",
  "Couple Arguing",
  "Selfie Stick",
  "Wedding Happening",
  "Group Shot With Strangers",
  "Person Asleep In Public",
  "High Limit Room",
  "Slot Jackpot Celebration",
  "Street Performer",
  "Fake Designer Handbag",
  "Matching Outfits",
  "Cowboy Hat",
  "Poker Face Sunglasses",
  "Frozen Cocktail",
  "Vegas Sign Selfie",
  "Pool Party Wristband",
  "Casino Chips Photo",
  "Hotel Upgrade Story",
  "Someone Lost Their Friends",
  "Buffet Plate Mountain",
  "Tattoo Shop",
  "Sports Bet Slip",
  "Blackjack Table",
  "Roulette Spin",
  "Bachelor Wearing Sash",
  "Bachelorette Wearing Veil",
  "Golf Polo Crew",
  "Someone Singing Karaoke",
  "Bellagio Fountain Video",
  "Free Space"
];

export default function App() {
  const [player, setPlayer] = useState(
    localStorage.getItem("vegas-player") || ""
  );

  const [found, setFound] = useState({});

  const [screen, setScreen] = useState("board");

  useEffect(() => {
    if (!player) return;

    const saved = JSON.parse(
      localStorage.getItem(
        `vegas-found-${player}`
      ) || "{}"
    );

    setFound(saved);
  }, [player]);

  useEffect(() => {
    if (!player) return;

    localStorage.setItem(
      `vegas-found-${player}`,
      JSON.stringify(found)
    );
  }, [found, player]);

  const toggleSquare = (square) => {
    setFound((prev) => ({
      ...prev,
      [square]: !prev[square]
    }));
  };

  const changePlayer = () => {
    localStorage.removeItem("vegas-player");
    setPlayer("");
    setFound({});
  };

  const resetBoard = () => {
    if (window.confirm("Reset all progress?")) {
      localStorage.removeItem(
        `vegas-found-${player}`
      );
      setFound({});
    }
  };

  const count =
    Object.values(found).filter(Boolean).length;

  const percent = Math.round(
    (count / SQUARES.length) * 100
  );

  const bingo = count >= 25;

  const leaderboard = PLAYERS.map((name) => {
    const saved = JSON.parse(
      localStorage.getItem(
        `vegas-found-${name}`
      ) || "{}"
    );

    return {
      name,
      score:
        Object.values(saved).filter(Boolean)
          .length
    };
  }).sort((a, b) => b.score - a.score);

  if (!player) {
    return (
      <div className="app">
        <h1>🎰 Vegas Bingo 2026</h1>

        <h2>Select Player</h2>

        {PLAYERS.map((p) => (
          <button
            key={p}
            className="playerBtn"
            onClick={() => {
              localStorage.setItem(
                "vegas-player",
                p
              );
              setPlayer(p);
            }}
          >
            {p}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="app">
      <h1>🎰 Vegas Bingo 2026</h1>

      <div className="playerTag">
        Playing as: <strong>{player}</strong>
      </div>

      <div className="topButtons">
        <button onClick={changePlayer}>
          Change Player
        </button>

        <button onClick={resetBoard}>
          Reset Board
        </button>
      </div>

      {screen === "board" && (
        <>
          {bingo && (
            <div className="bingoBanner">
              🎉 BINGO ACHIEVED! 🎉
            </div>
          )}

          <div className="progress">
            <div
              className="progressFill"
              style={{
                width: `${percent}%`
              }}
            />
          </div>

          <p>
            {count}/{SQUARES.length} Found (
            {percent}%)
          </p>

          <div className="grid">
            {SQUARES.map((square) => (
              <button
                key={square}
                className={
                  found[square]
                    ? "square found"
                    : "square"
                }
                onClick={() =>
                  toggleSquare(square)
                }
              >
                {square}
              </button>
            ))}
          </div>
        </>
      )}

      {screen === "leaderboard" && (
        <div className="leaderboard">
          <h2>🏆 Leaderboard</h2>

          {leaderboard.map(
            (entry, index) => (
              <div
                key={entry.name}
                className="leaderRow"
              >
                <span>
                  {index + 1}. {entry.name}
                </span>

                <strong>
                  {entry.score}
                </strong>
              </div>
            )
          )}
        </div>
      )}

      {screen === "photos" && (
        <div className="leaderboard">
          <h2>📸 Photos</h2>

          <div className="leaderRow">
            Photo uploads coming next...
          </div>
        </div>
      )}

      {screen === "settings" && (
        <div className="leaderboard">
          <h2>⚙️ Settings</h2>

          <div className="leaderRow">
            Room Code: VEGAS26
          </div>

          <div className="leaderRow">
            Players: 6
          </div>
        </div>
      )}

      <div className="bottomNav">
        <button onClick={() => setScreen("board")}>
          🎰 Board
        </button>

        <button
          onClick={() =>
            setScreen("leaderboard")
          }
        >
          🏆 Leaderboard
        </button>

        <button onClick={() => setScreen("photos")}>
          📸 Photos
        </button>

        <button
          onClick={() =>
            setScreen("settings")
          }
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
