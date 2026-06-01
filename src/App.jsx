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

  const [found, setFound] = useState(
    JSON.parse(localStorage.getItem("vegas-found") || "{}")
  );

  const [screen, setScreen] = useState("board");

  useEffect(() => {
    localStorage.setItem(
      "vegas-found",
      JSON.stringify(found)
    );
  }, [found]);

  const toggleSquare = (square) => {
    setFound({
      ...found,
      [square]: !found[square]
    });
  };

  const changePlayer = () => {
    localStorage.removeItem("vegas-player");
    window.location.reload();
  };

  const resetBoard = () => {
    if (window.confirm("Reset all progress?")) {
      localStorage.removeItem("vegas-found");
      setFound({});
    }
  };

  const leaderboard = PLAYERS.map((name) => ({
    name,
    score:
      player === name
        ? Object.values(found).filter(Boolean).length
        : 0
  })).sort((a, b) => b.score - a.score);

  const count = Object.values(found).filter(Boolean).length;
  const percent = Math.round(
    (count / SQUARES.length) * 100
  );

  if (!player) {
    return (
      <div className="app">
        <h1>🎰 Vegas Bingo 2026</h1>

        <h2>Select Player</h2>

        {PLAYERS.map((p) => (
          <button
            key={p}
            className="
