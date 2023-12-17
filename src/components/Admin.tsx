import { useEffect, useState } from "react";
import { adminSupabase } from "../api/adminSupabase";
import { User } from "@supabase/supabase-js";
import { PageWrapper } from "./PageWrapper";
import axios from "axios";
import { Game } from "../../stateTypes";
import { Link } from "react-router-dom";
import { apiUrl } from "../api/constants";

export const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [gameBoards, setGameBoards] = useState<Game | null>(null);
  useEffect(() => {
    // Function to fetch users from Supabase
    const fetchUsers = async () => {
      try {
        // Replace 'users' with the name of your Supabase table containing user data
        const { data, error } = await adminSupabase.auth.admin.listUsers({
          perPage: 1000,
        });
        if (error) {
          throw error;
        }
        console.log(data);
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // Fetch users when the component mounts
    fetchUsers();

    const fetchPrivateBoards = async () => {
      try {
        const { data: privateBoards } = await axios.get(
          `${apiUrl}/api/getPrivateBoards`
        );
        setGameBoards(privateBoards);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchPrivateBoards();
  }, []);

  return (
    <PageWrapper>
      <div className="GameCard w-full">
        <h2 className="font-bold text-2xl leading-none text-center normal-case mb-2">
          Admin <span className="text-sm">({users.length} users)</span>
        </h2>
        <table className="text-left text-base max-w-full" cellPadding={10}>
          <thead className="border-b">
            <tr>
              <th>No.</th>
              <th>Email</th>
              <th>Id</th>
              <td>Games</td>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.email}
                className="even:bg-gray-900 even:!bg-opacity-30 "
              >
                <td>{index + 1}</td>
                <td>{user.email}</td>
                <td>{user.id}</td>
                <td>
                  {gameBoards &&
                    Object.values(gameBoards)
                      .filter((game) => game.userId === user.id)
                      .map((game, index) => (
                        <Link
                          key={game.name + index}
                          className="block"
                          to={`/private`}
                          state={{ data: game }}
                        >
                          {game.name}
                        </Link>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
};
