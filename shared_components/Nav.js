import React, { useContext } from 'react'
import Link from 'next/link'
import { GlobalContext } from '../context/GlobalContext';

export default function nav({isAdmin}) {
  const [globalContext, setGlobalContext] = useContext(GlobalContext)
  const {currentPage} = globalContext


    return (
      <nav style={{ cursor: "pointer" }}>
        <Link href="/">
          <div className={`nav-item ${currentPage === "Home" && "active"}`}>
            Home
          </div>
        </Link>

        <Link href="/game" replace>
          <a>
            <div className={`nav-item ${currentPage === "Game" && "active"}`}>
              Game
            </div>
          </a>
        </Link>

        <Link href="/ranking?type=default" replace>
          <a>
            <div
              className={`nav-item ${currentPage === "Ranking" && "active"}`}
            >
              Ranking
            </div>
          </a>
        </Link>

        {isAdmin && (
          <Link href="/admin" replace>
            <a>
              <div
                className={`nav-item ${currentPage === "Admin" && "active"}`}
              >
                Admin
              </div>
            </a>
          </Link>
        )}

        <Link href="/notifications" replace>
          <a>
            <div
              className={`nav-item ${currentPage === "Notificações" && "active"}`}
            >
              Alertas
            </div>
          </a>
        </Link>

      </nav>
    );
}
