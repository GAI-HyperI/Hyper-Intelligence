const navbarTemplate = `
  <template id="navbar-template">
    <nav
  class="navbar navbar-expand-lg navbar-dark bg-black px-sm-3 px-2 fixed-top"
  style="padding-top: 0.9rem !important; padding-bottom: 0.9rem !important"
>
  <div class="container-fluid navbar-content p-0">
    <a
      class="navbar-brand d-flex flex-row align-items-center gap-2"
      ><img src="./assets//images/ieee mb white png.png" height="22px" />

      <p class="m-0 d-sm-block d-none mt-1">CPSCom 2025</p>
      <p class="m-0 d-sm-none mt-1"></p>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a
                class="nav-link active"
                aria-current="page"
                href="https://ieee-cybermatics.org/2025/cpscom/index.html"
                >Home</a
              >
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle text-white"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Call for Papers
              </a>
              <ul class="dropdown-menu dropdown-menu-black">
                <li>
                  <a class="dropdown-item" href="/Call for Paper.jpg">Call for Papers</a>
                </li>
              </ul>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle text-white"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
             >
                Conferences
              </a>
              <ul class="dropdown-menu dropdown-menu-black">
                <li>
                  <a class="dropdown-item" href="../blockchain/index.html">Blockchain 2025</a>
                </li>
                <li>
                  <a class="dropdown-item" href="../smartdata/index.html">SmartData 2025</a>
                </li>
                <li>
                  <a class="dropdown-item" href="../ithings/index.html">iThings 2025</a>
                </li>
                <li>
                  <a class="dropdown-item" href="../greencom/index.html">GreenCom 2025</a>
                </li>
                 <li>
                <a class="dropdown-item" href="../ica3pp/index.html">ICA3PP 2025</a>
              </li>
              </ul>
            </li>
            <li class="nav-item">
              <a
                class="nav-link active"
                aria-current="page"
                href="https://ieee-cybermatics.org/2025/keynotes.html"
                >Keynotes</a
              >
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle text-white"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
              Committees
              </a>
              <ul class="dropdown-menu dropdown-menu-black">
                 <li><a class="dropdown-item" href="./tpc.html">Technical Program Committee</a></li>
              </ul>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link active"
                aria-current="page"
                href="https://ieee-cybermatics.org/2025/si.html"
              >
                Special Issues
              </a>
            </li>
            
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle text-white"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Attendance
              </a>
              <ul class="dropdown-menu dropdown-menu-black">
                <li>
                  <a class="dropdown-item" href="https://ieee-cybermatics.org/2025/venue.html">Venue</a>
                </li>
                <li>
                  <a class="dropdown-item" href="https://ieee-cybermatics.org/2025/travel/index.html">Travel</a>
                </li>
              </ul>
            </li>
            
            <li class="nav-item dropdown">
              <a
                class="nav-link active"
                aria-current="page"
            href="https://ieee-cybermatics.org/2025/2025%20IEEE%20Cybermatics%20Congress%20at%20Program.pdf"
              >
                Program
              </a>
            </li>
            
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle text-white"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Authors
              </a>
              <ul class="dropdown-menu dropdown-menu-black">
                <li>
                  <a class="dropdown-item" href="./CPScom 2025.htm">Accpted Papers</a>
                <!--  <a class="dropdown-item" href="./cfw.html">Registration</a>-->
                </li>
                <li>
                  <a class="dropdown-item" href="./aure.html">Author Registration</a>
                <!--  <a class="dropdown-item" href="./cfw.html">Registration</a>-->
                </li>
                            <li>
                  <a class="dropdown-item" href="./Final Paper Instruction_CPScom.pdf">Final Paper Instruction</a>
                </li>
              </ul>
            </li>        
            <li class="nav-item">
              <a
                class="nav-link active"
                aria-current="page"
                href="https://ieee-cybermatics.org/2025/cpscom/contact.html"
                >Contact</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </template>
`;

function renderTemplate() {
  // 将模板插入到文档
  document.body.insertAdjacentHTML('beforeend', navbarTemplate);

  // 获取模板并渲染到页面
  const template = document.getElementById('navbar-template');
  const topbar = document.getElementById('topbar');
  if (template && topbar) {
    const clone = template.content.cloneNode(true);
    topbar.appendChild(clone);
  } else {
    console.error('Navbar template or topbar container not found. Ensure <div id="topbar"> exists and top_block.js is loaded.');
  }
}

// 页面加载时渲染模板
document.addEventListener('DOMContentLoaded', renderTemplate);