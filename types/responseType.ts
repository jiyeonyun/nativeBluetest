export interface Result<T> {
    resultCode: string;
    resultData: T;
    resultMessage: string;
    status: string;
}
export interface LoginResult {
    data: Auth;
}

export interface Auth {
    accessToken: string;
    refreshToken: string;
    manager: ManagerAuth;
    menuList: MenuListAuth[];
}
export interface ManagerAuth {
    account: string;
    confirmManger: number;
    createdAt: string;
    email: string;
    failCount: number;
    managerId: number;
    managerNm: string;
    orgNm: string;
    positionNm: string;
    roleGroupIdList: any[];
    roleGroupList: any[];
    telNo: string;
    updatedAt: string;
    useBeginDt: string;
    useEndDt: string;
    useFg: number;
    userRole: string;
}

export interface MenuListAuth {
    menuId: string;
    menuNm: string;
    menuOrder: string;
    menuUrl: string;
}
export interface TokenData {
    accessToken: string | null;
    refreshToken: string | null;
}
export interface LoginFormData {
    account: string;
    password: string;
    userTotp: string | number;
}
