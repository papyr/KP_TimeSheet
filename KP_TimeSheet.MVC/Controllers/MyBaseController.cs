using System;
using KP.TimeSheets.Persistance;
using Microsoft.AspNetCore.Mvc;

namespace KP.TimeSheets.MVC
{
	public class MyBaseController : ControllerBase
	{
		public RASContext DBContext{get; private set;}
		public MyBaseController(RASContext db){
			this.DBContext = db;
		}


		public bool MainChecks(string ver, out string error)
        {
            error = null;

            // if (string.IsNullOrEmpty(ver) || (ver != "-1" && ver != Util.Version))
            // {
            //     error = "ورژن برنامه صحیح نیست. لطفا رفرش نمایید تا آخرین نسخه از سرور دریافت گردد";
            //     return false;
            // }

            //if (this.UserRoles == null || this.UserRoles.Count == 0)
            //{
            //    error = "خطا - برای کاربر رولی یافت نشد - username: " + (string.IsNullOrEmpty(this.UserName) ? "-" : this.UserName);
            //    return false;
            //}
            return true;
        }

        public IActionResult ReturnError(Exception ex, string errorText)
        {
            var error = errorText + " - " + ex.Message + (ex.InnerException == null ? "" : " - " + ex.InnerException.Message);
            return this.StatusCode(statusCode: (int)System.Net.HttpStatusCode.BadRequest, value: error);
        }

	}
}