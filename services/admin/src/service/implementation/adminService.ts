import { ForbiddenError, NotFoundError, UnauthorizedError } from "@codeflare/common";
import { AdminRepositoty } from "../../repository/implementation/adminRepository";
import { IAdminRepostory } from "../../repository/interface/IAdminRepository";
import { IAdminService } from "../interface/IAdminService";
import { IAdminSchema } from "../../modal/interface/IAdminSchema";
import { IAdminDto } from "../../dto/adminServiceDto";

/** Implementaion of Admin Service */
export class AdminService implements IAdminService {
    private adminRepository: IAdminRepostory;

    /**
     * Constructs an instance of AdminService.
     * @param adminRepository - The admin repository to use for performing operations on admins.
     */
    constructor(adminRepository: AdminRepositoty) {
        this.adminRepository = adminRepository;
    }

    /**
     * Retrieves an admin from the database using the provided ID.
     * @param _id - The ID of the admin to retrieve.
     * @returns A promise that resolves to an object containing the admin if found, otherwise rejects with an error.
     * @throws NotFoundError if the admin is not found.
     */
    async getAdmin(payload: string): Promise<IAdminDto> {
        try {
            if(!payload) throw new UnauthorizedError('Athentication failed. Please login again!')

            const user = JSON.parse(payload as string)
   
            const admin = await this.adminRepository.findOne({ _id : user._id });

            if (!admin) throw new NotFoundError("Account not found. Please contact support!");

            return admin
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Updates an existing admin in the database with the given admin object.
     * @param _id - The id of the admin to update.
     * @param admin - The admin object to update the admin with.
     * @returns A promise that resolves to an object containing the updated admin if successful, otherwise rejects with an error.
     * @throws Error if the updating of the admin fails.
     */
    async updateAdmin(
        payload: string,
        admin: IAdminSchema
    ): Promise<IAdminDto> {
        try {
            if(!payload) throw new ForbiddenError()

            const user = JSON.parse(payload as string)

            const updatedAdmin = await this.adminRepository.update(
                { _id : user._id },
                { $set: admin },
                { new: true }
            );

            if (!updatedAdmin) throw new Error("Failed to update profile!");

            return updatedAdmin
        } catch (err: any) {
            throw err;
        }
    }
}
