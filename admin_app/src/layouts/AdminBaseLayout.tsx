import Header from "@components/Header";
import Sidebar from "@components/sidebar/Sidebar";
import { BaseProps } from "@definitions/props.definition";

const AdminBaseLayout = ({ children }: BaseProps) => {
  return (
    <>
      <div className="font-INTER">
        <div className="w-full">
          <div
            className="w-56 -sm bg-gray-50 hidden lg:block z-10 fixed  top-0 h-full overflow-y-scroll sidebar-scroll"
            style={{ minWidth: "240px" }}
          >
            <Sidebar />
          </div>
          <div className="flex-grow mt-10 p-2 lg:ml-56 ">{children}</div>

          {/* <*/}
        </div>
      </div>
    </>
  );
};

export default AdminBaseLayout;
