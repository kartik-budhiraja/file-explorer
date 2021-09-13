import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SERVER = "http://localhost:8080";

const useSocket = (onInitialzation, onAdd, onChange) => {
  const socket = useRef(null);
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(SERVER);
      socket.current.emit("Get Base");
    }

    if (socket.current) {
      socket.current.on("connection", () => {
        console.log(`Connection successful`);
      });

      socket.current.on("Base", onInitialzation);
      socket.current.on("Change", onChange);
      socket.current.on("Update Children", onAdd);
    }
  }, []);

  return socket.current;
};

export default useSocket;
