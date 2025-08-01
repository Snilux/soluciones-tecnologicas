import { z } from "zod";

const emailUsers = z.object({
  email: z.string().trim().email("El correo electrónico no es válido"),
});

const validateEmail = (data) => {
  return emailUsers.safeParse(data);
};

export { validateEmail };
