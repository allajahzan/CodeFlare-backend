import {
    BadRequestError,
    comparePassword,
    ConflictError,
    ExpiredError,
    ForbiddenError,
    generateJwtToken,
    hashPassword,
    isTokenExpired,
    JwtPayloadType,
    NotFoundError,
    UnauthorizedError,
    verifyJwtToken,
} from "@codeflare/common";
import jwt from "jsonwebtoken";
import {
    IUserLoginDto,
    IUserRegisterDto,
    IRefreshTokenDto,
    IUserDto,
} from "../../dto/userServiceDto";
import { sendOtp } from "../../utils/sendResetLink";
import { sendInvitation } from "../../utils/sendInvitation";
import { IUserService } from "../interface/IUserService";
import { IUserRepository } from "../../repository/interface/IUserRepository";
import { IUserSchema } from "../../entities/IUserSchema";
import { ObjectId } from "mongoose";

/** Implementation of User Service */
export class UserService implements IUserService {
    private userRepository: IUserRepository;

    /**
     * Constructs an instance of UserService.
     * @param userRepository - The user repository to use for performing operations on users.
     */
    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Logs in a user with the given email and password and returns an access and refresh token if the credentials are valid.
     * @param email - The email of the user to log in.
     * @param password - The password of the user to log in.
     * @returns A promise that resolves to an object containing the access and refresh tokens if the login is successful, otherwise the promise is rejected with an error.
     */
    async userLogin(
        email: string,
        password: string,
        role: string
    ): Promise<IUserLoginDto> {
        try {
            const user = await this.userRepository.findOne({ email, role });

            if (!user) throw new UnauthorizedError("Account not found!");

            if (!user.password)
                throw new UnauthorizedError("You have to reset your password!"); // If no password is set

            const isPsswordMatch = await comparePassword(password, user.password); // Compare password

            if (!isPsswordMatch) throw new UnauthorizedError("Incorrect password!");

            const payload = { _id: user._id as string, role: user.role };

            const refreshToken = generateJwtToken(
                payload,
                process.env.JWT_REFRESH_TOKEN_SECRET as string,
                "1d"
            ); // Refresh token

            const accessToken = generateJwtToken(
                payload,
                process.env.JWT_ACCESS_TOKEN_SECRET as string,
                "5m"
            ); // Access token

            return { role: user.role, accessToken, refreshToken };
        } catch (err: unknown) {
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
        name: string,
        email: string,
        role: string,
        password: string
    ): Promise<IUserRegisterDto> {
        try {
            const isUserExist = await this.userRepository.findUserByEmail(email);

            if (isUserExist) throw new ConflictError("Account already exists!");

            const hashedPassword = await hashPassword(password);

            const newUser = await this.userRepository.create({
                name,
                email,
                role,
                password: hashedPassword,
            });

            if (!newUser) throw new Error("Failed to add the user!");

            // Mapping data to return type
            const userRegisterDto: IUserRegisterDto = {
                email: newUser.email,
                role: newUser.role,
            };

            return userRegisterDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Verifies the user's email by sending an OTP to the user's email address.
     * @param email - The email of the user to verify.
     * @param role - The role of the user to verify.
     * @returns A promise that resolves if the email is verified successfully, otherwise the promise is rejected with an error.
     */
    async userVerifyEmail(email: string, role: string): Promise<void> {
        try {
            const user = await this.userRepository.findOne({ email, role });

            if (!user)
                throw new NotFoundError("Account not found. Please contact support!");

            const payload = { _id: user._id as string, role: user.role };

            const token = generateJwtToken(
                payload,
                process.env.JWT_ACCESS_TOKEN_SECRET as string,
                "24h"
            ); // Generate JWT token to send with email

            await this.userRepository.update(
                { email, role },
                { $set: { isTokenValid: true } }
            ); // Update isTokenValid

            sendOtp(user.name, email, role, token, "Reset your password - CodeFlare"); // Send reset password link
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Checks if the password reset link is valid by verifying the token.
     * @param token - The token used to verify the password reset link.
     * @returns A promise that resolves if the link is valid, otherwise the promise is rejected with an error.
     * @throws {NotFoundError} If the token is not found.
     * @throws {ExpiredError} If the token is expired.
     * @throws {NotFoundError} If the user associated with the token is not found.
     */
    async checkResetPasswordLink(token: string): Promise<void> {
        try {
            if (!token) throw new NotFoundError("Token not found!");

            if (isTokenExpired(token))
                throw new ExpiredError(
                    "Reset password link has expired. Please request for forgot password!"
                );

            const payload = verifyJwtToken(
                token,
                process.env.JWT_ACCESS_TOKEN_SECRET as string
            ) as JwtPayloadType; // Verify token

            if (!payload)
                throw new ExpiredError(
                    "Reset password link has expired. Please request for forgot password!"
                );

            const { _id, role } = payload;

            const user = await this.userRepository.findOne({
                _id,
                role,
            });

            if (!user)
                throw new NotFoundError("Account not found. Please contact support!");

            if (!user.isTokenValid)
                throw new ExpiredError(
                    "Reset password link has expired. Please request for forgot password!"
                );
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Resets the user's password using the provided token and new password.
     * @param password - The new password to set for the user.
     * @param confirmPassword - The confirmation of the new password to verify they match.
     * @param token - The token used to verify the user's identity and authorization to reset the password.
     * @returns A promise that resolves when the password reset process is complete.
     * @throws {Error} If the token is not found, expired, or invalid, or if the passwords do not match.
     * @throws {NotFoundError} If the user account associated with the token is not found.
     */
    async userResetPassword(password: string, token: string): Promise<void> {
        try {
            if (!token) throw new NotFoundError("Token not found!");

            if (isTokenExpired(token))
                throw new ExpiredError(
                    "Reset password link has expired. Please request for forgot password!"
                );

            const payload = verifyJwtToken(
                token,
                process.env.JWT_ACCESS_TOKEN_SECRET as string
            ) as JwtPayloadType; // Verify token

            if (!payload)
                throw new ExpiredError(
                    "Reset password link has expired. Please request for forgot password!"
                );

            const { _id, role } = payload;

            const user = await this.userRepository.findOne({
                _id,
                role,
            });

            if (!user)
                throw new NotFoundError("Account not found. Please contact support!");

            if (!user.isTokenValid)
                throw new ExpiredError(
                    "Reset password link has expired. Please request for forgot password!"
                );

            const hashedPassword = await hashPassword(password); // Hash password

            await this.userRepository.update(
                { _id, role },
                { $set: { password: hashedPassword, isTokenValid: false } }
            );
        } catch (err: unknown) {
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
            ) as JwtPayloadType; // Verify token

            if (!payload) throw new ForbiddenError();

            const user = await this.userRepository.findOne({
                _id: payload._id,
                role: payload.role,
            });

            if (!user) throw new ForbiddenError();

            // Check if user is blocked
            if (user.isblock)
                throw new UnauthorizedError(
                    "Your account has been blocked. Please contact support!"
                );

            // Generate acccess token
            const accessToken = generateJwtToken(
                { _id: payload._id, role: payload.role },
                process.env.JWT_ACCESS_TOKEN_SECRET as string,
                "5m"
            );

            return { accessToken };
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Retrieves the user data based on the x-user-id header.
     * @param requesterId - The x-user-id header containing the user id.
     * @returns A promise that resolves to an object containing the user data if found, otherwise the promise is rejected with an error.
     * @throws {UnauthorizedError} If the requesterId is not provided or is invalid.
     * @throws {NotFoundError} If the user is not found.
     */
    async getUser(requesterId: string): Promise<IUserDto> {
        try {
            if (!requesterId)
                throw new UnauthorizedError(
                    "Athentication failed. Please login again!"
                );

            const { _id } = JSON.parse(requesterId as string);

            const user = await this.userRepository.findOne({ _id });

            if (!user)
                throw new NotFoundError("Account not found. Please contact support!");

            // Mapping data to return type
            const userDto: IUserDto = {
                _id: user._id as string,
                name: user.name,
                email: user.email,
                role: user.role,
                ...(user.batch ? { batch: user.batch } : {}),
                ...(user.batches ? { batches: user.batches } : {}),
                ...(user.week ? { week: user.week } : {}),
                ...(user.phoneNo ? { phoneNo: user.phoneNo } : {}),
                createdAt: user.createdAt,
            };

            return userDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Retrieves a list of users based on the given roles and the token payload.
     * @param roles - The roles of the users to retrieve.
     * @param tokenPayload - The JSON web token payload containing the requester id and role.
     * @returns A promise that resolves to an array of user objects if the users are found, otherwise the promise is rejected with an error.
     * @throws {UnauthorizedError} If the token payload is invalid or not provided.
     * @throws {NotFoundError} If no users are found with the given roles and requester id.
     */
    async getUsers(tokenPayload: string): Promise<IUserDto[]> {
        try {
            let users;

            // No token, so request is from admin
            if (!tokenPayload) {
                throw new UnauthorizedError(
                    "You do not have permission to access this resource."
                );
            } else {
                const { _id, role } = JSON.parse(tokenPayload) as JwtPayloadType; // Requester id and role

                if (role === "admin") {
                    users = await this.userRepository.find({
                        role: { $in: ["coordinator", "instructor"] },
                    });
                } else if (role === "coordinator" || role === "instructor") {
                    const searchField =
                        role === "coordinator" ? "coordinatorId" : "instructorId"; // Which field, based on role

                    users = await this.userRepository.find({
                        [searchField]: _id,
                        role: { $in: ["student"] },
                    });
                } else if (role === "student") {
                    const student = await this.userRepository.findOne({ _id }); // Find the student

                    if (!student) {
                        throw new UnauthorizedError("Student not found.");
                    }

                    users = await this.userRepository.find({
                        $or: [
                            { batch: student.batch, role: "student", _id: { $ne: _id } }, // Students in the same batch
                            { _id: student.coordinatorId, role: "coordinator" }, // Coordinator of the batch
                            { _id: student.instructorId, role: "instructor" }, // Instructor of the batch
                        ],
                    });
                } else {
                    throw new UnauthorizedError(
                        "You do not have permission to fetch these users."
                    );
                }
            }

            // Mapping data to return type
            const userDto: IUserDto[] = users.map((user) => {
                return {
                    _id: user._id as string,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    ...(user.batch ? { batch: user.batch } : {}),
                    ...(user.batches ? { batches: user.batches } : {}),
                    ...(user.week ? { week: user.week } : {}),
                    ...(user.phoneNo ? { phoneNo: user.phoneNo } : {}),
                    ...(user.lastActive ? { lastActive: user.lastActive } : {}),
                    createdAt: user.createdAt,
                };
            });

            return userDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Creates a new user in the database with the given user data and the role of the requester.
     * @param user - The user data to create a new user with.
     * @param tokenPayload - The x-user-payload header containing the requester id and role.
     * @returns A promise that resolves to an object containing the newly created user if successful, otherwise the promise is rejected with an error.
     * @throws {UnauthorizedError} If the token is not provided or is invalid.
     * @throws {ConflictError} If the user already exists with the same email.
     * @throws {Error} If any error occurs during the creation of a new user.
     */
    async createUser(user: IUserSchema, tokenPayload: string): Promise<IUserDto> {
        try {
            if (!tokenPayload)
                throw new UnauthorizedError(
                    "Athentication failed. Please login again!"
                );

            const { _id, role } = JSON.parse(tokenPayload) as JwtPayloadType; // Requester id and role

            const isUserExist = await this.userRepository.findUserByEmail(user.email);

            if (isUserExist)
                throw new ConflictError("An account with this email already exists!");

            const additionalFields =
                role === "coordinator"
                    ? { coordinatorId: _id as unknown as ObjectId }
                    : role === "instructor"
                        ? { instructorId: _id as unknown as ObjectId }
                        : {};

            const newUser = await this.userRepository.create({
                ...user,
                ...additionalFields, // Add only if role is "coordinator" or "instructor"
            });

            if (!newUser) throw new Error("Failed to add the user!");

            const payload = { _id: newUser._id as string, role: newUser.role }; // Generate JWT token to send with email

            const token = generateJwtToken(
                payload,
                process.env.JWT_ACCESS_TOKEN_SECRET as string,
                "24h"
            );

            sendInvitation(
                user.name,
                user.email,
                user.role,
                token,
                "Invitation to join - CodeFlare"
            ); // Send invitation to user

            // Mapping data to return type
            const userDto: IUserDto = {
                _id: newUser._id as string,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                ...(newUser.batch ? { batch: newUser.batch } : {}),
                ...(newUser.batches ? { batches: newUser.batches } : {}),
                ...(newUser.week ? { week: newUser.week } : {}),
                ...(newUser.phoneNo ? { phoneNo: newUser.phoneNo } : {}),
                ...(newUser.lastActive ? { lastActive: newUser.lastActive } : {}),
                createdAt: newUser.createdAt,
            };

            return userDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates an existing user in the database with the given user object.
     * @param _id - The id of the user to update.
     * @param user - The user object to update the user with.
     * @returns A promise that resolves to an object containing the updated user if successful, otherwise rejects with an error.
     * @throws {ConflictError} If the user already exists.
     * @throws {Error} If any error occurs during user update.
     */
    async updateUser(_id: string, user: IUserSchema): Promise<IUserDto> {
        try {
            const isUserExist = await this.userRepository.findOne({
                _id: { $ne: _id },
                email: user.email,
            });

            if (isUserExist)
                throw new ConflictError("An account with this email already exists!");

            const updatedUser = await this.userRepository.update(
                { _id },
                { $set: user },
                { new: true }
            );

            if (!updatedUser) throw new Error("Failed to update the user!");

            // // Mapping data to return type
            // const userDto: IUserDto = {
            //     _id: updatedUser._id as string,
            //     name: updatedUser.name,
            //     email: updatedUser.email,
            //     role: updatedUser.role,
            //     ...(updatedUser.batch ? { batch: updatedUser.batch } : {}),
            //     ...(updatedUser.batches ? { batches: updatedUser.batches } : {}),
            //     ...(updatedUser.week ? { week: updatedUser.week } : {}),
            //     ...(updatedUser.phoneNo ? { phoneNo: updatedUser.phoneNo } : {}),
            //     ...(updatedUser.lastActive
            //         ? { lastActive: updatedUser.lastActive }
            //         : {}),
            //     createdAt: updatedUser.createdAt,
            // };

            return updatedUser;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Blocks or unblocks a user with the given _id.
     * @param _id - The id of the user to block or unblock.
     * @returns A promise that resolves to an object containing the blocked or unblocked user if successful, otherwise rejects with an error.
     * @throws {NotFoundError} If the user is not found.
     * @throws {Error} If any error occurs during user blocking or unblocking.
     */
    async changeUserStatus(_id: string): Promise<void> {
        try {
            const user = await this.userRepository.findOne({ _id });

            if (!user) {
                throw new NotFoundError("User not found!");
            }

            const updatedUser = user.isblock
                ? await this.userRepository.unblockUser(_id)
                : await this.userRepository.blockUser(_id);

            if (!updatedUser) {
                throw new Error(
                    user.isblock
                        ? "Failed to unblock the user!"
                        : "Failed to block the user!"
                );
            }
        } catch (err: unknown) {
            throw err;
        }
    }
}
