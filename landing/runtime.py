import yaml
import argparse
from datetime import datetime

class ECSSLRuntime:
    def __init__(self, flow_file):
        with open(flow_file, 'r', encoding='utf-8') as f:
            self.flow = yaml.safe_load(f)
        # Asegurarnos de que haya al menos un use_case
        use_cases = self.flow.get('use_cases')
        if not use_cases:
            raise ValueError("No se encontró 'use_cases' en el flujo ECSSL.")
        self.use_case = use_cases[0]
        # Tomar paths bien: primero del root, si no existe, del propio use_case
        self.paths = self.flow.get('paths', self.use_case.get('paths', []))
        self.agents = {agent['name']: agent for agent in self.flow.get('agents', [])}
        self.semantic_log = []

    def log(self, action, agent, target=None, details=None):
        entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'action': action,
            'agent': agent
        }
        if target:
            entry['target'] = target
        if details:
            entry['details'] = details
        self.semantic_log.append(entry)

    def simulate(self):
        print(f"\nStarting ECSSL Runtime for UseCase: {self.use_case['name']}")
        print(f"Description: {self.use_case.get('description', '')}\n")

        for path_name in self.use_case.get('paths', []):
            path = next((p for p in self.paths if p['name'] == path_name), None)
            if not path:
                continue
            print(f"---\nTrigger: {path['trigger']}")
            agent = 'ContextHelper'
            action = f"process_{path_name}"
            print(f"{agent} is handling '{path_name}'...")
            self.log(action=action, agent=agent, target=f"Path:{path_name}")

            # Simulate developer confirmation if needed
            if path_name in ['ProposesNarrative', 'ProposesKPI']:
                response = input("Accept suggestion? (y/n): ").strip().lower()
                decision = 'accepted' if response == 'y' else 'rejected'
                print(f"Developer {decision} the suggestion.")
                self.log(action=f"{path_name}_{decision}", agent="Developer", target=path_name)

        print("\nSimulation complete. Semantic log entries:")
        for entry in self.semantic_log:
            print(entry)

def main():
    parser = argparse.ArgumentParser(description="ECSSL Semantic Runtime")
    parser.add_argument('flow_file', help="Path to the ECSSL flow YAML file")
    args = parser.parse_args()

    runtime = ECSSLRuntime(args.flow_file)
    runtime.simulate()

if __name__ == '__main__':
    main()
