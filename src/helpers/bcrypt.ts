import bcrypt from "bcryptjs";

export const hashPassword = (plainPassword: string): string => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plainPassword, salt);
};

export const comparePassword = (
    plainPassword: string,
    hashedPassword: string
): boolean => {
    return bcrypt.compareSync(plainPassword, hashedPassword);
};
