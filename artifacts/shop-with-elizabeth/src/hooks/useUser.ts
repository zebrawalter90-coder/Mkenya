import { useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
}

const USER_ID_KEY = "elizabeth_user_id";
const USERNAME_KEY = "elizabeth_username";

export function useUser() {
  const [user, setUser] = useState<User>({ id: "", name: "" });

  useEffect(() => {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(USER_ID_KEY, id);
    }
    const name = localStorage.getItem(USERNAME_KEY) || "";
    setUser({ id, name });
  }, []);

  const setUsername = (name: string) => {
    const trimmed = name.trim();
    localStorage.setItem(USERNAME_KEY, trimmed);
    setUser((prev) => ({ ...prev, name: trimmed }));
  };

  return { user, setUsername };
}
