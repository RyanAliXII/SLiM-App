import HeaderIcon from "@assets/images/library-icon.svg";
import ProfileDropdown from "@components/ProfileDropdown";
import { BaseProps } from "@definitions/props.definition";
import { useNotifications } from "@hooks/data-fetching/notification";
import { AiOutlineSearch } from "react-icons/ai";
import { GiLightBackpack } from "react-icons/gi";
import { ImBooks } from "react-icons/im";
import { IoIosNotifications } from "react-icons/io";
import { RiFileList2Fill, RiUserFill } from "react-icons/ri";
import { NavLink } from "react-router-dom";
const AuthBaseLayout = ({ children }: BaseProps) => {
  const { data: notifications } = useNotifications();
  return (
    <div className="font-INTER min-h-screen">
      <header className="w-full  flex justify-around items-center py-3 bg-blue-800 text-white">
        <div>
          <img
            src={HeaderIcon}
            alt="library-logo"
            className="w-12 lg:w-14 ml-5"
          />
        </div>
        <nav className="h-full mr-10 hidden md:block">
          <ul className="h-full flex items-center gap-7 mr-5">
            <li>
              <NavLink to="/search" className={isHeaderNavActive}>
                Search
              </NavLink>
            </li>
            <li>
              <NavLink to="/catalog" className={isHeaderNavActive}>
                Catalog
              </NavLink>
            </li>
            <li>
              <NavLink to="/bag" className={isHeaderNavActive}>
                Bag
              </NavLink>
            </li>
            <li>
              <div className="dropdown ">
                <div
                  tabIndex={0}
                  role="button"
                  className="rounded-btn p-0 text-sm  normal-case focus:bg-none font-normal flex items-center gap-1"
                >
                  Books
                </div>
                <ul className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4">
                  <li className="text-gray-700">
                    <NavLink to="/borrowed-books" className={isHeaderNavActive}>
                      Borrowed
                    </NavLink>
                  </li>
                  <li className="text-gray-700">
                    <NavLink to="/queues" className={isHeaderNavActive}>
                      Queues
                    </NavLink>
                  </li>
                </ul>
              </div>
            </li>
            <li>
              <NavLink to="/reservations" className={isHeaderNavActive}>
                Reservations
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="h-full flex items-center">
          <ProfileDropdown />
          <div className="dropdown dropdown-left ">
            <div
              tabIndex={0}
              role="button"
              className="rounded-btn p-0 text-sm  normal-case focus:bg-none font-normal flex items-center gap-1"
            >
              <IoIosNotifications className="text-2xl" />
              <div className="badge badge-primary">{notifications?.length}</div>
            </div>
            <ul className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-80 mt-4">
              {notifications?.slice(0, 10).map((n) => {
                return (
                  <li className="border-b" key={n.id}>
                    <div className="text-gray-700">{n.message}</div>
                  </li>
                );
              })}
              {/* <li className="border-b">
                <div className="text-gray-700">
                  The book you have requested has been approved.
                </div>
              </li>
              <li className="border-b">
                <div className="text-gray-700">
                  The book you have requested has been approved.
                </div>
              </li> */}
            </ul>
          </div>
        </div>
      </header>

      <main className="h-full"> {children}</main>
      <div className="h-20 w-full"></div>
      <div className="fixed w-full h-16 bg-white border border-t border-gray-50  drop-shadow text-gray-600 md:hidden bottom-0">
        <nav className="h-full w-full">
          <ul className="flex h-full w-full items-center justify-around">
            <li>
              <NavLink to={"/search"} className={isBottomNavActive}>
                <AiOutlineSearch />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/catalog"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl"
                }
              >
                <RiFileList2Fill />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/bag"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl"
                }
              >
                <GiLightBackpack />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/borrowed-books"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl"
                }
              >
                <ImBooks />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/profile"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl"
                }
              >
                <RiUserFill />
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
const isBottomNavActive = (nav: { isActive: Boolean; isPending: Boolean }) =>
  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl";

const isHeaderNavActive = (nav: { isActive: Boolean; isPending: Boolean }) =>
  nav.isActive
    ? "text-blue-500 text-xs lg:text-sm font-semibold"
    : "text-xs lg:text-sm";

export default AuthBaseLayout;
