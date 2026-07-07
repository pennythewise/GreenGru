from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.cn_codes import default_route_for, is_supported_cn_code
from app.db import get_session
from app.models_orm import Company, Product
from app.schemas import CompanyCreate, CompanyOut, ProductCreate, ProductOut

router = APIRouter(prefix="/api", tags=["companies"])


@router.post("/companies", response_model=CompanyOut)
async def create_company(payload: CompanyCreate, session: AsyncSession = Depends(get_session)):
    company = Company(name=payload.name, province=payload.province, contact_info=payload.contact_info)
    session.add(company)
    await session.commit()
    await session.refresh(company)
    return CompanyOut(id=company.id, name=company.name, province=company.province)


@router.post("/products", response_model=ProductOut)
async def create_product(payload: ProductCreate, session: AsyncSession = Depends(get_session)):
    if not is_supported_cn_code(payload.cn_code):
        raise HTTPException(
            status_code=422,
            detail=f"CN code '{payload.cn_code}' is not one of the 8 supported codes (PRD §6.1).",
        )

    route_was_defaulted = payload.production_route is None
    route = payload.production_route or default_route_for(payload.cn_code).value

    product = Product(
        company_id=payload.company_id,
        cn_code=payload.cn_code,
        production_route=route,
        annual_export_tonnes=payload.annual_export_tonnes,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return ProductOut(
        id=product.id,
        company_id=product.company_id,
        cn_code=product.cn_code,
        production_route=product.production_route,
        annual_export_tonnes=product.annual_export_tonnes,
        route_was_defaulted=route_was_defaulted,
    )
