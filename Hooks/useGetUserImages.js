import React from 'react'
import { storage } from '../firebase/firebaseContext';

export function useGetUserImages(user,id, callback) {
      storage
        .ref(`/users/${id}/profileImage`)
        .getDownloadURL()
        .then((url) => {
          user = { ...user, image: url };

          callback((users) => {
            return [...users, user]
              .sort((a, b) => {
                return b.points - a.points;
              })
              .filter((user) => {
                return user.points !== 0;
              });
          });
        });
    
        return null
}
