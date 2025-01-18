import {
    comparePassword,
    ConflictError,
    ForbiddenError,
    generateJwtToken,
    hashPassword,
    JwtPayloadType,
    UnauthorizedError,
} from "@codeflare/common";
import { IUserRepository } from "../../repository/interface/IUserRepository";
import { IUserService } from "../interface/IUserService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
    IUserLoginDto,
    IUserRegisterDto,
    IRefreshTokenDto,
} from "../../dto/userServiceDto";

/** Implementation of User Service */
export class UserService implements IUserService {
    private userRespository: IUserRepository;

    /**
     * Constructs an instance of UserService.
     * @param userReporsitory - The user repository to use for performing operations on users.
     */
    constructor(userReporsitory: IUserRepository) {
        this.userRespository = userReporsitory;
    }

    /**
     * Logs in a user with the given email and password and returns an access and refresh token if the credentials are valid.
     * @param email - The email of the user to log in.
     * @param password - The password of the user to log in.
     * @returns A promise that resolves to an object containing the access and refresh tokens if the login is successful, otherwise the promise is rejected with an error.
     */
    async userLogin(email: string, password: string, role: string): Promise<IUserLoginDto> {
        try {
            const user = await this.userRespository.findOne({email, role});

            if (!user) throw new UnauthorizedError("User not found");

            const isPsswordMatch = await comparePassword(password, user.password);

            if (!isPsswordMatch) throw new UnauthorizedError("Invalid password");

            const payload = { userId: user._id as string, role: user.role };

            const refreshToken = generateJwtToken(
                payload,
                process.env.JWT_REFRESH_TOKEN_SECRET as string,
                "1d"
            );

            const accessToken = generateJwtToken(
                payload,
                process.env.JWT_ACCESS_TOKEN_SECRET as string,
                "1m"
            );

            return { role: user.role, accessToken, refreshToken };
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Registers a new user with the given email, password and role.
     * @param email - The email of the user to register.
     * @param password - The password of the user to register.
     * @param role - The role of the user to register.
     * @returns A promise that resolves to the newly created user if successful, otherwise the promise is rejected with an error.
     */
    async userRegister(
        email: string,
        password: string,
        role: string
    ): Promise<IUserRegisterDto> {
        try {
            const isUserExist = await this.userRespository.findUserByEmail(email);

            if (isUserExist) throw new ConflictError("User already exists");

            const hashedPassword = await hashPassword(password); // hash password

            password = hashedPassword;

            const newUser = await this.userRespository.create({
                email,
                password,
                role,
            });

            if (!newUser) throw new Error("Failed to create the user");

            return newUser;
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Refreshes the access token using the provided refresh token.
     * @param token - The refresh token used to verify and generate a new access token.
     * @returns A promise that resolves to an object containing the new access token if successful, otherwise the promise is rejected with an error.
     * @throws {ForbiddenError} If the token is not provided.
     * @throws {Error} If any error occurs during token verification or generation.
     */
    async refreshToken(token: string): Promise<IRefreshTokenDto> {
        try {
            if (!token) throw new ForbiddenError();

            const payload = jwt.verify(
                token,
                process.env.JWT_REFRESH_TOKEN_SECRET as string
            ) as JwtPayloadType;

            if (!payload) throw new ForbiddenError();

            const accessToken = generateJwtToken(
                payload,
                process.env.JWT_ACCESS_TOKEN_SECRET as string,
                "1m"
            );

            return { accessToken };
        } catch (err: any) {
            throw err;
        }
    }
}
