import { Button, TextField, Box, Grid } from "@mui/material";
import { Stack } from "@mui/system";
import React, { useCallback, useRef, useState } from "react";
import { FieldError, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import CanvasDraw from "react-canvas-draw";

interface ImagineForm {
  prompt: string;
  promptStrength: number;
}

interface ImagineFormWithImage extends ImagineForm {
  image: Blob;
}

const runImaginationApi = async (
  data: ImagineFormWithImage
): Promise<string[]> => {
  const formData = new FormData();
  formData.set("prompt", data.prompt);
  formData.set("prompt_strength", `${data.promptStrength}`);
  formData.append("file", data.image);

  const result = await fetch("http://localhost:8000/imagine", {
    method: "POST",
    body: formData,
  });
  return await result.json();
};

const getErrorMessage = (error: FieldError | undefined) => {
  if (!error) {
    return undefined;
  }
  if (error.type === "required") {
    return "This field is required";
  }
};

const COLORS = ["black", "red", "green", "blue"];
const ColorSelector: React.FC<{
  selection: string;
  onChange: (color: string) => void;
}> = ({ selection, onChange }) => {
  return (
    <Stack direction="row" spacing={2}>
      {COLORS.map((color) => {
        return (
          <div
            key={color}
            style={{
              backgroundColor: color,
              border: selection === color ? "2px solid black" : undefined,
              width: "20px",
              height: "20px",
            }}
            onClick={() => onChange(color)}
          />
        );
      })}
    </Stack>
  );
};

const ImagineWidget: React.FC = () => {
  const mutation = useMutation(runImaginationApi);
  const [color, setColor] = useState("black");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ImagineForm>({ defaultValues: { promptStrength: 0.8 } });
  const canvasRef = useRef<any>();
  const runImagination = useCallback(
    async (data: ImagineForm) => {
      const dataUrl = canvasRef.current.getDataURL("image/png", false, "white");
      const blob = await (await fetch(dataUrl)).blob(); // convert to a blob
      mutation.mutate({ ...data, image: blob });
    },
    [mutation.mutate, canvasRef]
  );

  return (
    <Stack direction={"row"} spacing={2}>
      <form onSubmit={handleSubmit(runImagination)}>
        <Stack spacing={2}>
          <TextField
            id="prompt"
            label="Prompt"
            variant="outlined"
            error={!!errors["prompt"]}
            helperText={getErrorMessage(errors["prompt"])}
            {...register("prompt", { required: true })}
          />
          <TextField
            id="promptStrength"
            label="Prompt Strength"
            variant="outlined"
            error={!!errors["promptStrength"]}
            helperText={getErrorMessage(errors["promptStrength"])}
            {...register("promptStrength", { required: true })}
          />

          <CanvasDraw ref={canvasRef} brushColor={color} />
          <ColorSelector onChange={(c) => setColor(c)} selection={color} />

          <Button
            disabled={mutation.isLoading}
            type="submit"
            variant="contained"
          >
            Imagine That
          </Button>
        </Stack>
      </form>
      <Box>
        {mutation.isLoading ? "Loading..." : null}
        {mutation.data
          ? mutation.data.map((x) => <img key={x} src={x} />)
          : null}
      </Box>
    </Stack>
  );
};

export { ImagineWidget };
