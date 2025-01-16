import { NotFoundError } from "@codeflare/common";
import { AdminRepositoty } from "../../repository/implementation/adminRepository";
import { IAdminRepostory } from "../../repository/interface/IAdminRepository";
import { IAdminService } from "../interface/IAdminService";
import { IAdminSchema } from "../../modal/interface/IAdminSchema";

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

    async getAdmin(_id: string): Promise<any> {
        try{
            const admin = await this.adminRepository.findOne({_id});

            if(!admin) throw new NotFoundError("Admin not found");

            return {admin}
        }catch(err:any){
            throw err
        }
    }

    async updateAdmin(_id: string, admin: IAdminSchema): Promise<any> {
        try{
            const updatedAdmin = await this.adminRepository.update({_id}, {$set: admin}, {new : true});

            if(!updatedAdmin) throw new Error("Failed to update admin");

            return {updatedAdmin}
        }catch(err:any){
            throw err
        }
    }
}
