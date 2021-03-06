import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from './config.service';
import {
  IAuthor,
  ICollection,
  IDonation,
  IPagination,
  IPublication,
  IReaderAuthorInteraction,
} from '../models';

export interface IGetByIdResponse {
  author: IAuthor;
  reader?: IReaderAuthorInteraction;
}

export interface ISearchCommand {
  name?: string;
  publications_gt?: number;
  date_from?: string;
  date_to?: string;
  offset?: number;
  limit?: number;
  order_by?: string; // followers, publications, newest
}

export interface IDonateCommand {
  amount: number;
  comment: string;
}

export interface IDonateResponse {
  id: string;
  payment_link: string;
}

@Injectable()
export class AuthorService {
  private baseUrl: string;

  constructor(private http: HttpClient, configServ: ConfigService) {
    this.baseUrl = `${configServ.baseUrl()}/authors`;
  }

  public getById(id: string): Observable<IGetByIdResponse> {
    return this.http.get<IGetByIdResponse>(`${this.baseUrl}/${id}`);
  }

  public search(cmd: ISearchCommand): Observable<IPagination<IAuthor>> {
    let params = new HttpParams();

    if (cmd.name) {
      params = params.append('name', cmd.name);
    }

    if (cmd.publications_gt) {
      params = params.append('publications_gt', cmd.publications_gt.toString());
    }

    if (cmd.date_from) {
      params = params.append('date_from', cmd.date_from);
    }

    if (cmd.date_to) {
      params = params.append('date_to', cmd.date_to);
    }

    if (cmd.offset) {
      params = params.append('offset', cmd.offset.toString());
    }

    if (cmd.limit) {
      params = params.append('limit', cmd.limit.toString());
    }

    if (cmd.order_by) {
      params = params.append('order_by', cmd.order_by);
    }

    return this.http.get<IPagination<IAuthor>>(`${this.baseUrl}`, { params });
  }

  public getPublications(id: string, include: string = ''): Observable<IPagination<IPublication>> {
    let params = new HttpParams();

    if (include) {
      params = params.append('include', include);
    }

    return this.http.get<IPagination<IPublication>>(`${this.baseUrl}/${id}/publications`, { params });
  }

  public getCollections(id: string, include: string = ''): Observable<IPagination<ICollection>> {
    let params = new HttpParams();

    if (include) {
      params = params.append('include', include);
    }

    return this.http.get<IPagination<ICollection>>(`${this.baseUrl}/${id}/collections`, { params });
  }

  public getDonations(id: string, include: string = ''): Observable<IPagination<IDonation>> {
    let params = new HttpParams();

    if (include) {
      params = params.append('include', include);
    }

    return this.http.get<IPagination<IDonation>>(`${this.baseUrl}/${id}/donations`, { params });
  }

  public follow(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/follow`, {});
  }

  public unfollow(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/unfollow`, {});
  }

  public donate(id: string, cmd: IDonateCommand): Observable<IDonateResponse> {
    return this.http.post<IDonateResponse>(`${this.baseUrl}/${id}/donate`, cmd);
  }
}
