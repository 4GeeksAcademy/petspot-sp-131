import React from "react";
import { Link } from "react-router-dom";
import LogoPetSpot from "../assets/img/logo/Logo_PetSpot.svg"

export const Navbar = () => {
	return (
		<nav className="navbar sticky-top navbar-expand-md">
			<div className="container-fluid h-100 py-3">
				<Link to="/" className="navbar-brand">
					<img src={LogoPetSpot} alt="PetSpot logo" style={{ height: "48px", width: "auto", display: "block" }} />
				</Link>
				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarTogglerDemo01">
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						<li className="nav-item">
							<Link className="nav-link active" aria-current="page" to="#">About us</Link>
						</li>
						<li className="nav-item">
							<Link to="/user/login" className="nav-link fw-bold">
								Login User
							</ Link>
						</li>
						<li className="nav-item">
							<Link to="/signup/user" className="nav-link fw-bold">
								Join Today User
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/places/login" className="nav-link fw-bold ">
								Login Place
							</Link>
						</li>
					</ul>
				</div>

			</div>
		</nav>
	)
};
