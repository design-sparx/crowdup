import {ReactNode} from "react";

interface IProps {
    children: ReactNode
}
const AuthLayout = ({children}: IProps) => {
    return (
        <div>
            {children}
        </div>
    );
};

export default AuthLayout;
