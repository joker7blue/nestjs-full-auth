export interface IpInfoResponse {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
  readme: string;
}

export class IpinfoService {
  async getIpInfo(ip: string): Promise<IpInfoResponse | null> {
    try {
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      const data = await response.json();

      if (data && data.country) {
        return data as IpInfoResponse;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
