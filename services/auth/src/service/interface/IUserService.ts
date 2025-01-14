/** Interface for User Service */
export interface IUserService {
    userLogin(email: string, password: string): Promise<any>;
    userRegister(email: string, password: string, role: string): Promise<any>;
    refreshToken(token: string): Promise<any>
}
