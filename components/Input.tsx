import { StyleSheet, TextInput, TextInputProps } from "react-native";

type InputProps = TextInputProps & {

}

export function Input(props: InputProps) {
  const { style } = props;

  return (
    <TextInput
      {...props}
      style={[style, styles.inputStyle]}
      placeholderTextColor={"#d3d3d3"}
    />
  )
}

const styles = StyleSheet.create({
  inputStyle: {
    color: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#353839",
    borderRadius: 100,
  }
})
