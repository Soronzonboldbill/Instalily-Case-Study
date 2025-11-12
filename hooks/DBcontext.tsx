import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Database } from "@/lib/db/db";
import * as CRYPTO from "expo-crypto"

type DBContextProps = {
  db: Database,
  sessionID: string;
}

const DBContext = createContext<DBContextProps | null>(null);

type DBProviderProps = {
  children: ReactNode
}

export function DBProvider({ children }: DBProviderProps) {
  const [db] = useState(() => Database.getInstance());
  const [sessionId, setSessionId] = useState<string>("");

  /* create a new session on app load, there is at most one thing in the userRow table at all times */
  useEffect(() => {
    const initDB = async () => {
      await db.open();

      const row = await db.db?.getFirstAsync<{ device_id: string }>("SELECT * FROM userRow");
      let id = "";

      if (!row) {
        id = CRYPTO.randomUUID()
        await db.db?.runAsync(`INSERT INTO userRow (device_id) values (?)`, [id])
      } else {
        id = row.device_id;
      }

      const sessionQuery =
        `INSERT INTO sessions (
          id,
          device_id,
          created_at
        ) VALUES (
          ?,
          ?,
          ?
        );`

      const sessionID = CRYPTO.randomUUID()
      await db.db?.runAsync(sessionQuery, [sessionID, id, new Date().toString()]);
      setSessionId(sessionID);
    }

    try {
      initDB();
    } catch (error) {
      // TODO: log out message to contact support to fix this
      console.log(error);
    }
  }, [])

  /* Open/attach db to app on active app. Close on inactive/background state */
  useEffect(() => {
    let currentState: AppStateStatus = AppState.currentState;

    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (currentState === "active" && nextState.match(/inactive|background/)) {
        await db.close();
      }
      currentState = nextState;
    });

    db.open();

    return () => {
      subscription.remove();
      db.close();
    };

  }, [db]);

  const DBContextVals = {
    db,
    sessionID: sessionId
  }

  return <DBContext.Provider value={DBContextVals}>{children}</DBContext.Provider>
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) {
    throw new Error("DB context must be used in a DB provider")
  }
  return ctx
}
