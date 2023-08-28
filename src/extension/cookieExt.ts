class Cookie{


    static setCookie(name: string, value: string, days: number) {
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = "expires=" + expirationDate.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
      }

    static getCookie(name: string): string | null {
        const cookieName = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(";");
      
        for (let i = 0; i < cookieArray.length; i++) {
          let cookie = cookieArray[i];
          while (cookie.charAt(0) === " ") {
            cookie = cookie.substring(1);
          }
          if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
          }
        }
        return null;
      }
}

export default Cookie;