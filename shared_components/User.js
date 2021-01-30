import React from 'react'
import styles from '../pages/ranking/ranking.module.css'
import UserDefaultImage from '../public/images/user-default-image.png'

export default function User({user, classList}) {
    return (
      <div>
        <div className={`user-in-list ${classList ? styles[classList] : ""}`}>
          <div className={`position-container`}>{user.privateInfo ? '?' : user.position}</div>
          <img className="user-image" src={user.hasImage ? user.image : UserDefaultImage} alt="" />
          <div className="info-area">
            <p className="username-in-list">{user.username}</p>
            <p>{user.privateInfo ? "privado" : `pontos: ${user.points}`}</p>
          </div>
        </div>
      </div>
    );
}
