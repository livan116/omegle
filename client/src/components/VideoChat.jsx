
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://omegle-z4fa.onrender.com"); // change to your backend

const VideoChat = () => {
  const [roomId, setRoomId] = useState("");
  const [peerId, setPeerId] = useState(null);
  const [joined, setJoined] = useState(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    socket.on("room-joined", () => setJoined(true));

    socket.on("peer-connected", ({ peerId }) => {
        setPeerId(peerId);
        createOffer(peerId);
      });
      

    socket.on("offer", async ({ offer, from }) => {
      await createAnswer(offer);
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding received ice candidate", e);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = stream;

    peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach((track) =>
      peerConnectionRef.current.addTrack(track, stream)
    );

    peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: peerId,
          });
        }
      };

    peerConnectionRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };
  };

  const createOffer = async (peerId) => {
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("offer", { offer, to: peerId });
  };
  

  const createAnswer = async (offer) => {
    await peerConnectionRef.current.setRemoteDescription(offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socket.emit("answer", { answer, to: peerId });
  };
  

  const joinRoom = async () => {
    await startMedia();
    socket.emit("join-room", roomId);
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      {!joined && (
        <>
          <input
            type="text"
            placeholder="Enter Room ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
          />
          <button onClick={joinRoom}>Join Room</button>
        </>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <video ref={localVideoRef} autoPlay muted width={300} />
        <video ref={remoteVideoRef} autoPlay width={300} />
      </div>
    </div>
  );
};

export default VideoChat;
