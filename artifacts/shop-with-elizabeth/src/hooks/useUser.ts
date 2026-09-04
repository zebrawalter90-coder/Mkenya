import { useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
}

const USER_ID_KEY = "elizabeth_user_id";
const USERNAME_KEY = "elizabeth_username";

function generateName(id: string): string {
  return "User_" + id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

export function useUser() {
  const [user, setUser] = useState<User>({ id: "", name: "" });

  useEffect(() => {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(USER_ID_KEY, id);
    }
    let name = localStorage.getItem(USERNAME_KEY);
    if (!name) {
      name = generateName(id);
      localStorage.setItem(USERNAME_KEY, name);
    }
    setUser({ id, name });
  }, []);

  const setUsername = (name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;
    localStorage.setItem(USERNAME_KEY, normalizedName);
    setUser((currentUser) => ({ ...currentUser, name: normalizedName }));
  };

  return { user, setUsername };
}
