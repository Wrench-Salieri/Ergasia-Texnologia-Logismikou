using System;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;

namespace NativeShell
{
    public class Form1 : Form
    {
        public Form1()
        {
            this.Text = "React Native Shell";
            this.Width = 1000;
            this.Height = 800;

            // Compute the absolute path to the React index.html
            string projectRoot = Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory).Parent.Parent.Parent.FullName;
            string htmlPath = Path.Combine(projectRoot, "frontend", "build", "index.html");

            var webView = new WebView2
            {
                Dock = DockStyle.Fill,
                Source = new Uri(htmlPath)
            };

            this.Controls.Add(webView);
        }
    }
}
