import { TextInputProps } from "react-native";

export type GenericInput = TextInputProps & {
  type: "genericInput";
};

export type GenericFormElement = GenericInput;
