import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";

import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId } from "@/common/recoil/room";

import NotFoundModal from "../modals/NotFound";

const Home = () => {
  const { openModal } = useModal();
  const setAtomRoomId = useSetRoomId();
  const router = useRouter();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  // Set background color
  useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);

  // Handle room creation and joining events
  useEffect(() => {
    const handleCreatedRoom = (roomIdFromServer: string) => {
      setAtomRoomId(roomIdFromServer);
      router.push(roomIdFromServer);
    };

    const handleJoinedRoom = (roomIdFromServer: string, failed?: boolean) => {
      if (failed) {
        openModal(<NotFoundModal id={roomId} />);
      } else {
        setAtomRoomId(roomIdFromServer);
        router.push(roomIdFromServer);
      }
    };

    socket.on("created", handleCreatedRoom);
    socket.on("joined", handleJoinedRoom);

    return () => {
      socket.off("created", handleCreatedRoom);
      socket.off("joined", handleJoinedRoom);
    };
  }, [roomId, router, setAtomRoomId, openModal]);

  // Leave room on component mount
  useEffect(() => {
    socket.emit("leave_room");
    setAtomRoomId("");
  }, [setAtomRoomId]);

  // Handlers
  const handleCreateRoom = () => {
    socket.emit("create_room", username);
  };

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomId.trim()) {
      socket.emit("join_room", roomId, username);
    }
  };

  return (
    <div className="flex flex-col items-center py-24">
      {/* Title */}
      <h1 className="text-5xl font-extrabold leading-tight sm:text-extra">
        CollaBoard
      </h1>
      <h3 className="text-xl sm:text-2xl text-gray-600">
        Real-time Collaboration Whiteboard
      </h3>

      {/* Username Input */}
      <div className="mt-10 flex flex-col gap-2">
        <label className="self-start font-bold text-gray-700">
          Enter your name
        </label>
        <input
          className="input"
          placeholder="Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value.slice(0, 15))}
        />
      </div>

      {/* Separator */}
      <div className="my-8 h-px w-96 bg-gray-300" />

      {/* Join Room Form */}
      <form className="flex flex-col items-center gap-3" onSubmit={handleJoinRoom}>
        <label className="self-start font-bold text-gray-700">Enter Room ID</label>
        <input
          className="input"
          placeholder="Room ID..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.trim())}
        />
        <button className="btn" type="submit">
          Join
        </button>
      </form>

      {/* OR Separator */}
      <div className="my-8 flex w-96 items-center gap-2">
        <div className="h-px w-full bg-gray-300" />
        <p className="text-gray-500">or</p>
        <div className="h-px w-full bg-gray-300" />
      </div>

      {/* Create Room Section */}
      <div className="flex flex-col items-center gap-2">
        <h5 className="self-start font-bold text-gray-700">Create New Room</h5>
        <button className="btn" onClick={handleCreateRoom}>
          Create
        </button>
      </div>
    </div>
  );
};

export default Home;
