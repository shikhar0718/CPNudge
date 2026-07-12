export interface CodeChefContest {
  contest_code: string;
  contest_name: string;
  contest_start_date_iso: string;
  contest_end_date_iso: string;
}

export interface CodeChefResponse {
  status: string;
  message: string;
  future_contests: CodeChefContest[];
}
