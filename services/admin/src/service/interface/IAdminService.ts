import { IGetAdminResponse } from "../../dto/adminServiceDto"
import { IAdminSchema } from "../../modal/interface/IAdminSchema"

/** Interface for Admin Service */
export interface IAdminService {
    getAdmin(_id: string) : Promise<IGetAdminResponse>
    updateAdmin(_id: string, admin: IAdminSchema) : Promise<IGetAdminResponse>
}