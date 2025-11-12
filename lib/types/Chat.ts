export type Message = {
  role: "human" | "ai";
  value: string;
  id?: string;
};

export type Chat = {
  id: string;
  title?: string;
  msgs: Message[];
};
