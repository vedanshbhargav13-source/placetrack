const companies = [];

export function listCompanies(req , res) {
    res.json(companies);
}

export function createCompany(req , res) {
    const {name , website , location , notes} = req.body;

    const newCompany = {
        id: Date.now() , 
        name , 
        location , 
        notes
    };

    companies.push(newCompany);
    
    res.status(201).json(newCompany);
}

export function getCompany(req , res) {
    const id = Number(req.params.id);
    const company = companies.find(
        company => company.id === id
    );

    if(!company) {
        return res.status(404).json({
            message : "Company not found"
        });
    }

    res.json(company);
}