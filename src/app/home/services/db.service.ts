import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import * as _ from 'lodash';

import { Song } from '../models/song.model';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private storage: SQLiteObject;
  songsList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter
  ) {
    this.platform.ready().then(() => {
      this.sqlite
        .create({
          name: 'song_list_db.db',
          location: 'default',
        })
        .then((db: SQLiteObject) => {
          this.storage = db;
          this.getDummyData();
        });
    });
  }

  dbState() {
    return this.isDbReady.asObservable();
  }

  fetchSongs(): Observable<Song[]> {
    return this.songsList.asObservable();
  }

  getDummyData() {
    this.httpClient
      .get('assets/dump.sql', { responseType: 'text' })
      .subscribe((data) => {
        this.sqlPorter
          .importSqlToDb(this.storage._objectInstance, data)
          .then(() => {
            this.getAllSongs();
            this.isDbReady.next(true);
          })
          .catch((error) => console.error(error));
      });
  }

  getAllSongs() {
    return this.storage
      .executeSql('SELECT * FROM songtable;', [])
      .then((res) => {
        const songs: Song[] = [];
        if (res.rows.length > 0) {
          for (let i = 0; i < res.rows.length; i++) {
            songs.push({
              id: res.rows.item(i).id,
              artistName: res.rows.item(i).artistName,
              songName: res.rows.item(i).songName,
            });
          }
        }

        this.songsList.next(songs);
      });
  }

  getSong(id: string): Promise<Song> {
    return this.storage.executeSql('', [id]).then((res) => {
      return {
        id: res.rows.item(0).id,
        songName: res.rows.item(0).songName,
        artistName: res.rows.item(0).artistName,
      };
    });
  }

  addSong(song: Song) {
    console.log(song);
    const data = [song.songName, song.artistName];
    return this.storage
      .executeSql(
        'INSERT INTO songtable (songName, artistName) VALUES (?, ?);',
        data
      )
      .then(
        () => this.getAllSongs(),
        (error) => console.error(error)
      );
  }

  updateSong(id: string, song: Song) {
    const data = [song.songName, song.artistName];
    return this.storage
      .executeSql(
        `UPDATE songtable SET songName = ?, artistName = ? WHERE id = ${id};`,
        data
      )
      .then(() => this.getAllSongs());
  }

  deleteSong(id: string) {
    return this.storage
      .executeSql('DELETE FROM songtable WHERE id = ?;', [id])
      .then(
        () => this.getAllSongs(),
        (error) => console.error(error)
      );
  }
}
