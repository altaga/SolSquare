"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Orbitron } from "next/font/google";
import { Box, LinearProgress, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });

const Journey = () => {
  const progress = 43; // Progress percentage
  const tasks = [
    { name: "Create an account", completed: true },
    { name: "Create your first post", completed: true },
    { name: "Reply to someone's post", completed: true },
    { name: "Have one of your posts reach 10k BONK", completed: false },
    { name: "Have one of your posts reach 50 replies", completed: false },
    { name: "Boost others a total of 100k BONK", completed: false },
    { name: "Have one of your posts reach 1m BONK", completed: false },
  ];

  const particleContainerRef = useRef(null);

  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${60 + Math.random() * 150}px`;
      particleContainerRef.current.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 2000);
    };

    const interval = setInterval(createParticle, 200);
    return () => clearInterval(interval);
  }, []);

  // Find the first uncompleted task
  const firstUncompletedTaskIndex = tasks.findIndex(task => !task.completed);

  return (
    <Box
      sx={{
        backgroundColor: "none",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        color: "white"
      }}
    >
      <Image
        style={{ borderRadius: "15px", margin: "1rem" }}
        src={`/pfp/7.png`} // Use the mapped index for the pfp source
        alt="profile picture"
        width={150}
        height={150}
      />
      <Typography variant="h4" sx={{ fontFamily: orbitron.style.fontFamily }}>Rit Rafa</Typography>
      <Box sx={{ width: "80%", marginTop: "1rem" }}>
        <Typography variant="h6" sx={{ fontFamily: orbitron.style.fontFamily }}>Overall Progress</Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ 
            height: "1rem", 
            borderRadius: "5px", 
            backgroundColor: "#d3d3d3", 
            marginTop: "0.5rem",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "rgb(231, 140, 25)"
            }
          }}
        />
        <Typography variant="body2" sx={{ marginTop: "0.5rem", textAlign: "right" }}>
          {progress}%
        </Typography>
      </Box>
      <Box sx={{ width: "80%", marginTop: "2rem", display: "flex", justifyContent: "space-between", position: "relative" }}>
        <Box sx={{ width: "70%", marginLeft: "5rem", position: "relative" }}>
          <Typography variant="h6" sx={{ fontFamily: orbitron.style.fontFamily }}>Goals</Typography>
          {tasks.map((task, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
              {task.completed ? (
                <Image src={"/bonk.webp"} alt="logo" width={22} height={22} style={{ marginRight: "0.5rem" }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ color: "rgb(231, 140, 25)", marginRight: "0.5rem" }} />
              )}
              <Typography variant="body1">{task.name}</Typography>
              {index === firstUncompletedTaskIndex && (
                <div>
                  <Box
                    sx={{
                      width: "12rem",
                      height: "2px",
                      backgroundColor: "rgb(231, 140, 25)",
                      marginLeft: "1rem",
                      position: "relative",
                      top: "1rem"
                    }}
                  />
                  <ArrowForwardIcon sx={{ color: "rgb(231, 140, 25)", marginLeft: "12.5rem", fontSize: "2rem", position: "relative", bottom: "0.05rem" }} />
                </div>
              )}
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            width: "300px",
            height: "300px",
            backgroundColor: "rgba(128,128,128,0.1)",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            marginLeft: "1rem",
            marginRight: "5rem",
            position: "relative",
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: orbitron.style.fontFamily }}>Next Reward</Typography>
          <Box className="particle-container" ref={particleContainerRef}>
            <Image
              className="spinning"
              style={{ 
                borderRadius: "15px", 
                margin: "1rem", 
                animation: "spin3d 5s linear infinite" 
              }}
              src={`/pfp/7.png`}
              alt="profile picture"
              width={150}
              height={150}
            />
          </Box>
          <Typography variant="body1">Respin your body trait, receive a rare or better replacement</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Journey;
