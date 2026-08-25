import streamlit as st
import pydeck as pdk
import pandas as pd
import requests
import os
import time

# Page Configuration
st.set_page_config(
    page_title="Disaster Authority Command Center - PS-05",
    page_icon="🚨",
    layout="wide",
    initial_sidebar_state="expanded"
)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")

# Tactical Command Center CSS Injection
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500;700;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
        background-color: #E2E8E0;
    }
    
    /* Headers font mono */
    h1, h2, h3, h4, .stMarkdown strong, div[data-testid="stMetricValue"] {
        font-family: 'JetBrains Mono', monospace !important;
    }
    
    .stApp {
        background-color: #E2E8E0;
    }
    
    /* Command Header Bar */
    .tactile-header {
        background-color: #385135;
        color: #FFFFFF;
        padding: 12px 20px;
        border-bottom: 4px solid #1E2C1D;
        font-family: 'JetBrains Mono', monospace;
    }
    
    /* Tactile Cards */
    .tactile-card {
        background-color: #FFFFFF;
        border: 2px solid #1E2C1D;
        box-shadow: 4px 4px 0px #1E2C1D;
        padding: 16px;
        margin-bottom: 16px;
    }
    
    .stButton>button {
        background-color: #6DBE5A !important;
        color: #000000 !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        border: 2px solid #1E2C1D !important;
        box-shadow: 3px 3px 0px #1E2C1D !important;
        border-radius: 0px !important;
        transition: all 0.1s ease-in-out !important;
    }
    
    .stButton>button:hover {
        transform: translate(-1px, -1px) !important;
        box-shadow: 4px 4px 0px #1E2C1D !important;
    }
    
    .stButton>button:active {
        transform: translate(2px, 2px) !important;
        box-shadow: 1px 1px 0px #1E2C1D !important;
    }
    
    /* Priority Badges */
    .badge-high {
        background-color: #E53E3E;
        color: white;
        padding: 2px 8px;
        border: 1px solid #000;
        font-family: 'JetBrains Mono', monospace;
        font-weight: bold;
    }
    
    .badge-med {
        background-color: #DD6B20;
        color: white;
        padding: 2px 8px;
        border: 1px solid #000;
        font-family: 'JetBrains Mono', monospace;
        font-weight: bold;
    }
    
    .badge-low {
        background-color: #38A169;
        color: white;
        padding: 2px 8px;
        border: 1px solid #000;
        font-family: 'JetBrains Mono', monospace;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Helper API functions
def fetch_api(endpoint):
    try:
        r = requests.get(f"{API_BASE_URL}{endpoint}", timeout=5)
        if r.status_code == 200:
            return r.json()
    except Exception as e:
        st.warning(f"Connecting to FastAPI backend at {API_BASE_URL}...")
    return []

def post_api(endpoint, payload=None):
    try:
        r = requests.post(f"{API_BASE_URL}{endpoint}", json=payload, timeout=5)
        if r.status_code in [200, 201]:
            return r.json()
    except Exception as e:
        st.error(f"API post error: {e}")
    return None

# Sidebar Controls & Synthetic Alert Simulator
with st.sidebar:
    st.markdown("### 🚨 DISASTER ALERT SIMULATOR")
    st.markdown("Trigger synthetic alert for demo workflow.")
    
    alert_type = st.selectbox("Alert Type", ["Flood", "Cyclone", "Landslide", "Medical Emergency"])
    severity_choice = st.selectbox("Alert Severity", ["Severe", "Warning", "Advisory"])
    alert_msg = st.text_input("Alert Message", value=f"SIMULATED ALERT: {alert_type.upper()} warning issued for Rourkela Sector 6.")
    
    if st.button("⚡ TRIGGER SIMULATED ALERT"):
        res = post_api("/alerts/trigger", {
            "alert_type": alert_type,
            "district": "Rourkela",
            "severity": severity_choice,
            "message": alert_msg
        })
        if res:
            st.success("Synthetic Disaster Alert Triggered!")
            time.sleep(1)
            st.rerun()

    st.markdown("---")
    st.markdown("### ⚙️ DEMO CONTROLS")
    if st.button("🔄 1-CLICK DEMO SEED"):
        post_api("/demo/seed")
        st.success("Demo environment seeded!")
        st.rerun()
        
    if st.button("🗑️ RESET DEMO STATE"):
        post_api("/demo/reset")
        st.success("Demo reset complete!")
        st.rerun()
        
    st.markdown("---")
    st.markdown("**PS-05 AUTHORITY DASHBOARD**")
    st.markdown("FastAPI • PyDeck • SciPy • Gemini NLP")

# Fetch Data
incidents = fetch_api("/incidents")
resources = fetch_api("/resources")
facilities = fetch_api("/facilities")
alerts = fetch_api("/alerts")

active_alert = next((a for a in alerts if a.get("is_active")), None)

# Main Title Header
st.markdown("""
<div class="tactile-header">
    <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
            <span style="background-color:#6DBE5A; color:#000; padding:2px 6px; font-weight:bold; font-size:12px;">SYSTEM STATUS: OPERATIONAL</span>
            <h2 style="margin:4px 0 0 0; font-size:22px;">REAL-TIME AUTHORITY DISASTER RESPONSE DASHBOARD</h2>
        </div>
        <div style="font-size:12px; text-align:right;">
            ROURKELA CONTROL HQ // DECISION SUPPORT PLATFORM
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

if active_alert:
    st.error(f"🚨 [{active_alert['alert_type'].upper()} ALERT - {active_alert['district'].upper()}] {active_alert['message']}")

# Key Performance Indicators (KPIs)
col1, col2, col3, col4 = st.columns(4)

high_count = len([i for i in incidents if i.get("priority_category") == "HIGH"])
unassigned_count = len([i for i in incidents if i.get("status") == "UNASSIGNED"])
avail_resources = len([r for r in resources if r.get("status") == "AVAILABLE"])
total_incidents = len(incidents)

col1.metric("TOTAL INCIDENTS", total_incidents)
col2.metric("HIGH PRIORITY", high_count, delta="CRITICAL", delta_color="inverse")
col3.metric("UNASSIGNED INCIDENTS", unassigned_count)
col4.metric("AVAILABLE RESCUE TEAMS", avail_resources)

st.markdown("---")

# Main Content Grid: Map & Priority Queue
top_col1, top_col2 = st.columns([7, 5])

with top_col1:
    st.markdown("### 🗺️ LIVE GEOSPATIAL PYDECK MAP & HEATMAP")
    
    # Prepare DataFrame for PyDeck
    if incidents:
        inc_df = pd.DataFrame(incidents)
        
        # Color mapping: High=Red, Medium=Yellow, Low=Green
        def get_color(row):
            cat = row.get("priority_category", "LOW")
            if cat == "HIGH":
                return [229, 62, 62, 220] # Red
            elif cat == "MEDIUM":
                return [221, 107, 32, 220] # Yellow
            return [56, 161, 105, 220] # Green

        inc_df["color"] = inc_df.apply(get_color, axis=1)
        inc_df["radius"] = inc_df["priority_score"] * 12
        
        # PyDeck Scatter Layer for Incidents
        incident_layer = pdk.Layer(
            "ScatterplotLayer",
            inc_df,
            get_position=["longitude", "latitude"],
            get_color="color",
            get_radius="radius",
            radius_min_pixels=8,
            radius_max_pixels=25,
            pickable=True,
        )
        
        # Heatmap Layer
        heatmap_layer = pdk.Layer(
            "HeatmapLayer",
            inc_df,
            get_position=["longitude", "latitude"],
            get_weight="priority_score",
            radius_pixels=60,
            intensity=1.5,
            threshold=0.1
        )
        
        layers = [heatmap_layer, incident_layer]
        
        # Resources Layer if available
        if resources:
            res_df = pd.DataFrame(resources)
            res_df["color"] = [[43, 108, 176, 220] for _ in range(len(res_df))] # Blue
            resource_layer = pdk.Layer(
                "ScatterplotLayer",
                res_df,
                get_position=["longitude", "latitude"],
                get_color="color",
                radius_min_pixels=10,
                radius_max_pixels=16,
                pickable=True,
            )
            layers.append(resource_layer)

        # PyDeck View State (Rourkela Sector 6)
        view_state = pdk.ViewState(
            latitude=22.2604,
            longitude=84.8536,
            zoom=12.5,
            pitch=40,
        )

        r = pdk.Deck(
            layers=layers,
            initial_view_state=view_state,
            tooltip={"text": "{incident_type} (#{id})\nPriority: {priority_score}\nLocation: {location_name}"},
            map_style="mapbox://styles/mapbox/light-v10"
        )
        st.pydeck_chart(r)
    else:
        st.info("No incidents on map. Click 1-CLICK DEMO SEED in sidebar.")

with top_col2:
    st.markdown("### 📋 PRIORITY QUEUE (SORTED 0-100)")
    
    if incidents:
        selected_inc_id = st.selectbox(
            "Select Incident to Inspect & Dispatch Resource:",
            options=[inc["id"] for inc in incidents],
            format_func=lambda x: f"#{x} - {next((i['location_name'] for i in incidents if i['id'] == x), '')} | Priority: {next((i['priority_score'] for i in incidents if i['id'] == x), '')}/100 ({next((i['status'] for i in incidents if i['id'] == x), '')})"
        )
        
        target_inc = next((i for i in incidents if i["id"] == selected_inc_id), None)
        
        if target_inc:
            st.markdown(f"""
            <div class="tactile-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="badge-{target_inc['priority_category'].lower()}">{target_inc['priority_score']} / 100 ({target_inc['priority_category']})</span>
                    <span style="font-family:monospace; font-weight:bold;">STATUS: {target_inc['status']}</span>
                </div>
                <h3 style="margin:8px 0 4px 0;">{target_inc['location_name']}</h3>
                <p style="font-size:13px; color:#333; background:#F4F7F3; padding:8px; border:1px solid #1E2C1D;">
                    "{target_inc['description']}"
                </p>
                <div style="font-size:12px; font-family:monospace; margin-top:8px;">
                    • AI Severity: <b>{target_inc['ai_severity']}</b> | Affected: <b>{target_inc['people_affected']} people</b> | Vulnerable: <b>{'YES' if target_inc['vulnerable_people'] else 'NO'}</b>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            # Show Score Breakdown
            if target_inc.get("score_breakdown"):
                sb = target_inc["score_breakdown"]
                st.markdown("**EXPLAINABLE SCORE BREAKDOWN:**")
                st.json(sb)
    else:
        st.write("No incidents currently in queue.")

st.markdown("---")

# Bottom Section: SciPy Matching & Manual Dispatcher
bot_col1, bot_col2 = st.columns([6, 6])

with bot_col1:
    st.markdown("### 🤖 SCIPY RESOURCE MATCHING ENGINE")
    st.markdown("Uses `scipy.optimize.linear_sum_assignment` and Haversine distance matrix for global optimal dispatch.")
    
    if st.button("⚙️ RUN SCIPY OPTIMIZATION MATCHING"):
        opt_res = post_api("/assignments/optimize")
        if opt_res and opt_res.get("assignments"):
            st.success(f"SciPy solved matching for {opt_res['total_assigned']} incidents!")
            opt_df = pd.DataFrame(opt_res["assignments"])
            st.dataframe(opt_df[["incident_id", "incident_location", "priority_score", "recommended_resource_name", "distance_km", "is_compatible"]], use_container_width=True)
        else:
            st.info("No unassigned incidents or available resources to match.")

with bot_col2:
    st.markdown("### 🚒 RESOURCE DISPATCH CONTROL")
    
    if incidents and resources:
        avail_res_list = [r for r in resources if r["status"] == "AVAILABLE"]
        unassigned_inc_list = [i for i in incidents if i["status"] == "UNASSIGNED"]
        
        if unassigned_inc_list and avail_res_list:
            inc_choice = st.selectbox(
                "Incident to Dispatch:",
                options=[i["id"] for i in unassigned_inc_list],
                format_func=lambda x: f"#{x} - {next(i['location_name'] for i in unassigned_inc_list if i['id'] == x)} (Priority: {next(i['priority_score'] for i in unassigned_inc_list if i['id'] == x)})"
            )
            
            res_choice = st.selectbox(
                "Rescue Resource to Assign:",
                options=[r["id"] for r in avail_res_list],
                format_func=lambda x: f"#{x} - {next(r['name'] for r in avail_res_list if r['id'] == x)} ({next(r['type'] for r in avail_res_list if r['id'] == x)})"
            )
            
            if st.button("🚀 ASSIGN RESOURCE & DISPATCH"):
                assign_res = post_api("/assignments", {
                    "incident_id": inc_choice,
                    "resource_id": res_choice
                })
                if assign_res:
                    st.success(f"Resource assigned successfully! Status updated to BUSY.")
                    time.sleep(1)
                    st.rerun()
        else:
            st.info("All active incidents assigned or no available resources.")

# Resource Status Summary Table
st.markdown("---")
st.markdown("### 📊 RESCUE RESOURCE INVENTORY STATUS")
if resources:
    res_table_df = pd.DataFrame(resources)
    st.dataframe(res_table_df[["id", "name", "type", "capability", "capacity", "status"]], use_container_width=True)
