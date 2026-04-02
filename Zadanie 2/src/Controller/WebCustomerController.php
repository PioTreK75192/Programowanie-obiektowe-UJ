<?php

namespace App\Controller;

use App\Entity\Customer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class WebCustomerController extends AbstractController
{
    #[Route('/customers', name: 'app_customer_index')]
    public function index(EntityManagerInterface $em): Response
    {
        $customers = $em->getRepository(Customer::class)->findAll();

        return $this->render('customer/index.html.twig', [
            'customers' => $customers,
        ]);
    }
}
