export interface RequestBody {
  name: string;
}

export interface Country {
  country_id: string;
  probability: GLfloat;
}

export interface userProfileQuery {
  gender?: string;
  country_id?: string;
  age_group?: string;
}
