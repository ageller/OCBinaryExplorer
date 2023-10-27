# OC Binary Explorer
A website to explore results from the BASE-9 Open Cluster project

## Explanation of data

Users can interact with data in multiple ways within the website.  Data files are stored in `sqlite` format.  Each cluster has a database file, and there is also a summary database with information on all available clusters in our survey. Below we describe the tables in each database file and the columns in each table. 

### `cluster_summary.db` : 
the summary database

This file contains one table : `cluster_parameters`, with the following columns:

- `Cluster` : cluster name
- `Center_RA_hr`, `Center_Dec_deg` : central right ascension and declination for the cluster
- `Age_Gyr`, `Age_16_Gyr`, `Age_84_Gyr` ,  : median, 16th percentile and 84th percentile of the age posterior in Gyr for the cluster derived from our BASE-9 analysis
- `[Fe/H]`, `[Fe/H]_16`, `[Fe/H]_84` : median, 16th percentile and 84th percentile of the metallicity posterior for the cluster derived from our BASE-9 analysis 
#### awaiting renaming (and double check Av units)
- `Distance_m-M`, `Distance_m-M_16`, `Distance_m-M_84` : median, 16th percentile and 84th percentile of the distance modulus posterior in magnitudes for the cluster derived from our BASE-9 analysis 
- `Distance_pc` : median distance to the cluster in parsecs derived from our BASE-9 analysis
- `Av_mag`, `Av_mag_16`, `Av_mag_84` : median, 16th percentile and 84th percentile of the extinction posterior in magnitudes for the cluster derived from our BASE-9 analysis 
- `r_h_deg`, `r_h_pc`  : cluster half-mass radius in degrees and parsecs
#### check update to arc_min
- `r_eff_arcmin` :  cluster effective radius in arcminutes
- `r_core_arcmin`, `r_core_pc`,  `sig_r_core_arcmin` : cluster core radius in arcminutes and parsecs, and the 1 sigma error on the cluster core radius in arcminutes,  derived from a King model fit to the MLMS sample (and assuming the median distance to the cluster)
- `r_tidal_arcmin`, `sig_r_tidal_arcmin` : cluster tidal radius and the 1 sigma error on the cluster tidal radius in arcminutes aderived from a King model fit to the MLMS sample
#### double check the change to MLMS
- `N`, `N_MLMS` : total number of objects (single and binary) and the number of MLMS objects in the cluster
- `N_bin`, `N_bin_MLMS` : total number of binaries and the number of MLMS binaries in the cluster 
#### double check that  MS to MLMS
- `N1`, `N1_MLMS` : number of objects (single and binary) and the number of MLMS objects within one core radius from the cluster center  
#### awaiting renaming (per, **, arcmin)
- `central_rho_N1_per_arcmin2`, `central_rho_N1_per_pc2`, `central_rho_16_N1_per_pc2`, `central_rho_84_N1_per_pc2` : stellar number density within 1 core radius from the cluster center in units of N/arcmin^2 and N/pc^2 (respectively) and the 16th and 84th percentiles for this density
- `fb_i`,  `sig_fb_i` : raw binary fraction for all objects in our sample and the 1 sigma uncertainty on that value for the cluster
#### check that MS is changed to MLMS
- `fb_MLMS_i`, `sig_fb_MLMS_i` : raw binary fraction for the MLMS stars and the 1 sigma uncertainty on that value for the cluster
- `fb_MLMS_c`, `sig_fb_MLMS_c` : incompleteness corrected binary fraction for the MLMS stars and the 1 sigma uncertainty on that value for the cluster
#### check that this is q > 0.4 and MS changed to MLMS
- `fb_MLMS_c_big_q`, `sig_fb_MLMS_c_big_q` : incompleteness corrected binary fraction for the MLMS stars, including only binaries with q > 0.4, and the 1 sigma uncertainty on that value for the cluster
- `tot_mass_M_Sun`, `tot_mass_16_M_Sun`, `tot_mass_84_M_Sun` : total cluster mass (counting all stars in our sample) in solar masses and the 16th and 84th percentiles of the total mass  
- `tr_Myr`, `tr_16_Myr`, `tr_84_Myr` : half-mass relaxation time for the cluster in Myr and the 16th and 84th percentiles for that value

### `NGC_*.db` : 
the cluster database

Each cluster has its own database file (e.g., `NGC_188.db`).  Within each of these files are multiple tables.  Each table and the columns they contain are described below.


#### `cluster_posterior` : posterior distribution from our BASE-9 `singlePopMcmc` analysis

- `iteration` : iteration number in the MCMC chain
#### check the units on all these
- `logAge` : posterior value at each iteration for the log_10 age [Gyr] of the cluster
- `FeH` : posterior value at each iteration for the metallicity of the cluster
- `modulus` : posterior value at each iteration for the distance modulus of the cluster in magnitudes 
- `absorption` : posterior value at each iteration for the `Av` value of the cluster in millimagnitudes
#### what is logPost
- `logPost` : log of the likelihood value at each iteration
- `stage` : analysis stage (see the [BASE-9 documentation](https://base-9.readthedocs.io/en/latest/) for a detailed explanation)


####  `posterior_for_id_*` : posteriod distribution from our BASE-9 `sampleMass` analysis for each star.  The `*` should be replaced by a `source_id` for cluster members

`iteration` : iteration number in the MCMC chain
`mass` : posterior value at each iteration for the stellar mass in solar masses
`massRatio` : posterior value at each iteration for the mass ratio (m2/m1)
`membership` : posterior value at each iteration for the cluster membership probatility (binary value, 1 for member and 0 for non-member)

#### `parsec_isochrone` : PARSEC isochrone produced from the median values of the cluster posterior distribution, produced using BASE-9's `makeCMD` tool

Columns here should be self explanatory (each contains the magnitude in the given filter, except for the columns labelled `Mass` which contains the stellar mass in solar units); see the [PARSEC website](http://stev.oapd.inaf.it/cgi-bin/cmd) for more information. 

#### `stars_summary` : summary information for each star in our sample 

- `source_id` : Gaia source ID of the star
- `ra`, `dec` : the right ascension and declination of the star in degrees
- `pmra`, `pmdec` : the proper motion measurements of the star in right ascension and dclination in mas/yr
- `radial_velocity` : the RV measurement of the star in km/s
- `G`, `phot_g_mean_flux_over_error`, `G_BP`, `phot_bp_mean_flux_over_error`, `G_RP`, `phot_rp_mean_flux_over_error` : the Gaia photometric measurements and errors taken in Gaia G, G_BP, and G_RP bandpasses
- `parallax` : the parallax measurement of the star in mas 
- `teff_gspphot` :  the effective temperature estimate from Gaia 
- `ruwe` : the ruwe value from Gaia
- `number_of_neighbours`, `number_of_mates` : ancillary data from Gaia catalog matching 
- `g_ps`, `sigg_ps`, `r_ps`, `sigr_ps`, `i_ps`, `sigi_ps`, `z_ps`, `sigz_ps`, `y_ps`,  `sigy_ps` : the photometric measurments and errors for the Pan-STARRS g, r, i, z, and y bandpasses, respectively
- `J_2M`, `sigJ_2M`, `H_2M`, `sigH_2M`, `Ks_2M`, `sigKs_2M` : the photometric measurements and errors for the 2MASS survery in the J, H, and Ks bandpasses, respectively
- `rCenter` : the angular distance from the star from the cluster center in degrees
- `sig_E(B-V)`,  `E(B-V)` : the error and reddening value taken from the Bayestarr reddening map. 
- `PPa` : the probability the star is a cluster member as determined by its Gaia parallax measurment calaculated within our code
- `PRV` : the probability the star is a cluster member as determined by its Gaia radial-velocity measurement calculated within our code
-  `PM_ra`, `PM_dec`, `PPM` :  the probabilities the star is a cluster member as determined by its Gaia proper motion in the right ascension, proper motion in declination and combined probability for proper motion measuremnts calculated within our code
- `CMprior` : the final cluster membership probability we feed to BASE-9 (calculated from our code)
- `member`, `binary` : (True/False) our final identification of cluster members and binaries, resulting from our analysis of BASE-9 results  
- `m1Median`, `m1Std`, `m1_16`, `m1_84` : the median, standard deviation, 16th and 84th percentiles of the BASE-9 posterior distribution for primary mass 
- `qMedian`,`qStd`, `q_16`, `q_84` : the median, standard deviation, 16th and 84th percentiles of the BASE-9 posterior distribution for mass ratio.

